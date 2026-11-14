import { useRef, useState } from 'react';
import { messageForStatus, percentOf, reduce, validateFile, ACCEPTED_IMAGE_TYPES, type UploadState } from '../lib/uploadState';

interface Props {
  purpose: 'gallery' | 'portrait' | 'fact-proof';
  label: string;
  value: string | null;
  nullable: boolean;
  disabled?: boolean;
  hint?: string;
  onChange: (assetId: string | null) => void;
}

/** Uploads one image with visible progress, processing, success and error states. The image is attached when the item is saved. */
export function ImageUploader({ purpose, label, value, nullable, disabled, hint, onChange }: Props) {
  const [state, setState] = useState<UploadState>({ phase: 'idle' });
  const input = useRef<HTMLInputElement>(null);
  const busy = state.phase === 'uploading' || state.phase === 'processing';

  const apply = (event: Parameters<typeof reduce>[1]) => setState((s) => reduce(s, event));

  function send(file: File) {
    const problem = validateFile(file);
    if (problem) return apply({ type: 'fail', message: problem });

    apply({ type: 'start' });
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/admin/media?purpose=${purpose}`);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('X-Admin-Request', '1');
    xhr.setRequestHeader('X-Filename', encodeURIComponent(file.name));
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) apply({ type: 'progress', loaded: e.loaded, total: e.total });
    };
    xhr.upload.onload = () => apply({ type: 'sent' });
    xhr.onerror = () => apply({ type: 'fail', message: 'The connection was lost. Check your network and try again.' });
    xhr.onload = () => {
      let body: { asset?: { id: string; displayName: string }; error?: { message?: string } } | null = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        body = null;
      }
      if (xhr.status === 201 && body?.asset) {
        apply({ type: 'done', assetId: body.asset.id, name: body.asset.displayName });
        onChange(body.asset.id);
      } else {
        apply({ type: 'fail', message: body?.error?.message ?? messageForStatus(xhr.status) });
      }
    };
    xhr.send(file);
  }

  const onPick = (file: File | undefined) => {
    if (file) send(file);
    if (input.current) input.current.value = ''; // allows choosing the same file again
  };

  return (
    <fieldset className="uploader" disabled={disabled || busy}>
      <legend>{label}</legend>
      {value ? (
        <img className="upload-preview" src={`/api/admin/media/${value}/preview`} alt={`Current ${label.toLowerCase()} preview`} />
      ) : (
        <p className="hint">No image selected yet.</p>
      )}
      {hint && <p className="hint">{hint}</p>}

      <label className="upload-pick">
        <span>{value ? 'Replace image' : 'Choose image'}</span>
        <input
          ref={input}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </label>

      {state.phase === 'uploading' && (
        <>
          <progress max={100} value={state.percent} aria-label={`Upload progress for ${label}`} />
          <p role="status">Uploading {state.percent}%</p>
        </>
      )}
      {state.phase === 'processing' && <p role="status">Processing the image on the server. This can take a moment.</p>}
      {state.phase === 'success' && <p className="ok" role="status">{state.name} is ready. Save the item to use it.</p>}
      {state.phase === 'error' && <p className="err" role="alert">{state.message}</p>}

      {nullable && value && (
        <button className="btn btn-g" type="button" onClick={() => { setState({ phase: 'idle' }); onChange(null); }}>
          Remove image
        </button>
      )}
    </fieldset>
  );
}
