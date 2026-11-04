import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import type { Readable } from 'node:stream';
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { readdir } from 'node:fs/promises';
import { assertSafeKey, isStorageKey } from './format.js';

export class MissingObjectError extends Error {}

export interface StoredObject {
  body: Readable;
  contentLength?: number;
}

export interface StoredObjectInfo {
  key: string;
  modified: Date;
}

/** The storage contract. Adapters differ only in where the bytes live. */
export interface MediaStorage {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<StoredObject>;
  delete(key: string): Promise<void>;
  /** Every object this application wrote. Used to find files that no record describes. */
  listAll(): Promise<StoredObjectInfo[]>;
}

/** Development and tests only. Files live in a private folder and are never served directly. */
export class LocalStorage implements MediaStorage {
  private readonly root: string;
  constructor(root: string) {
    this.root = resolve(root);
  }

  private pathFor(key: string): string {
    assertSafeKey(key);
    const full = resolve(this.root, key);
    if (!full.startsWith(this.root + sep)) throw new Error('Unsafe storage path');
    return full;
  }

  async put(key: string, data: Buffer): Promise<void> {
    const path = this.pathFor(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data, { flag: 'wx' }); // never overwrite an existing object
  }

  async get(key: string): Promise<StoredObject> {
    const path = this.pathFor(key);
    try {
      const info = await stat(path);
      return { body: createReadStream(path), contentLength: info.size };
    } catch {
      throw new MissingObjectError(key);
    }
  }

  async delete(key: string): Promise<void> {
    await rm(this.pathFor(key), { force: true });
  }

  async listAll(): Promise<StoredObjectInfo[]> {
    const out: StoredObjectInfo[] = [];
    const base = join(this.root, 'media');
    let folders: string[] = [];
    try {
      folders = await readdir(base);
    } catch {
      return out; // nothing has been stored yet
    }
    for (const folder of folders) {
      let files: string[] = [];
      try {
        files = await readdir(join(base, folder));
      } catch {
        continue;
      }
      for (const file of files) {
        const key = `media/${folder}/${file}`;
        if (!isStorageKey(key)) continue; // unknown files are never listed, so never deleted
        const info = await stat(join(base, folder, file));
        out.push({ key, modified: info.mtime });
      }
    }
    return out;
  }
}

/** Production: any S3-compatible provider (AWS S3, Cloudflare R2, Backblaze B2, MinIO). The bucket stays private. */
export class S3Storage implements MediaStorage {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
  ) {}

  async put(key: string, data: Buffer, contentType: string): Promise<void> {
    assertSafeKey(key);
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: data, ContentType: contentType, CacheControl: 'public, max-age=86400' }),
    );
  }

  async get(key: string): Promise<StoredObject> {
    assertSafeKey(key);
    try {
      const out = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      if (!out.Body) throw new MissingObjectError(key);
      return { body: out.Body as Readable, contentLength: out.ContentLength };
    } catch (err) {
      if (err instanceof MissingObjectError || (err as { name?: string }).name === 'NoSuchKey') throw new MissingObjectError(key);
      throw err;
    }
  }

  async delete(key: string): Promise<void> {
    assertSafeKey(key);
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async listAll(): Promise<StoredObjectInfo[]> {
    const out: StoredObjectInfo[] = [];
    let token: string | undefined;
    do {
      const page = await this.client.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix: 'media/', ContinuationToken: token }));
      for (const o of page.Contents ?? []) {
        if (o.Key && o.LastModified && isStorageKey(o.Key)) out.push({ key: o.Key, modified: o.LastModified });
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
    return out;
  }
}

let instance: MediaStorage | null = null;

/** The storage provider selected by configuration. Created once per process. */
export function getStorage(): MediaStorage {
  if (instance) return instance;
  if (env.MEDIA_STORAGE === 's3') {
    const client = new S3Client({
      region: env.S3_REGION as string,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
      credentials: { accessKeyId: env.S3_ACCESS_KEY_ID as string, secretAccessKey: env.S3_SECRET_ACCESS_KEY as string },
    });
    instance = new S3Storage(client, env.S3_BUCKET as string);
  } else {
    instance = new LocalStorage(resolve(process.cwd(), env.MEDIA_LOCAL_DIR));
  }
  return instance;
}
