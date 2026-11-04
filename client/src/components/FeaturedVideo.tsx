import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicGet } from '../lib/publicApi';
type Featured = { id: string; title: string; description: string; embedUrl: string; thumbnailUrl: string };
export default function FeaturedVideo() {
  const [video, setVideo] = useState<Featured | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { publicGet<{ items: Array<Featured & { isFeatured: boolean }> }>('/videos').then(r => setVideo(r.items.find(v => v.isFeatured) ?? null)).catch(() => setVideo(null)); }, []);
  if (!video) return null;
  return <section className="wrap sec featured-video" aria-labelledby="featured-video-title">
    <div><p className="eyebrow">Discover AST Education</p><h2 id="featured-video-title">Take a closer look</h2><p>Watch our featured video and explore more from AST Education.</p><Link className="btn btn-g" to="/videos">Explore all videos</Link></div>
    <div className="featured-video-media">{playing ? <iframe src={`${video.embedUrl}?autoplay=1`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <button className="video-poster" onClick={() => setPlaying(true)} aria-label={`Play ${video.title}`}><img src={video.thumbnailUrl} alt="" loading="lazy" /><span aria-hidden="true">▶</span></button>}<h3>{video.title}</h3>{video.description && <p>{video.description}</p>}</div>
  </section>;
}
