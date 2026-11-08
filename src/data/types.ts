export type LayoutHint = 'hero' | 'wide' | 'normal' | 'small' | 'pairWithNext';

export type PortfolioMedia = {
  id: string;
  type: 'video' | 'image';
  /** Image URL, or the full-length video used on the project page. */
  src: string;
  /** Short muted loop used for hover previews (falls back to `src`). */
  preview?: string;
  /** Poster frame. Should be the first frame of `preview` to avoid a visual jump. */
  poster?: string;
  /** Intrinsic pixel size of the file. Only the ratio matters for layout. */
  width: number;
  height: number;
  alt: string;
  /** CSS object-position, only used with crop: 'cover'. */
  focalPoint?: string;
  layoutHint?: LayoutHint;
  /** Default 'contain' – never crops. Opt into 'cover' consciously. */
  crop?: 'contain' | 'cover';
};

export type Category = 'Brand' | 'Explainer' | 'Kinetic Type' | 'Experiments';

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  category: Category[];
  year?: number;
  client?: string;
  role?: string;
  tools?: string[];
  deliverables?: string[];
  description?: string;
  cover: PortfolioMedia;
  media: PortfolioMedia[];
  featured?: boolean;
  /** Marks sample content so it is visibly labelled until replaced. */
  placeholder?: boolean;
  order: number;
};
