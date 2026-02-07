import type { Tag } from '@/types/tag';

export interface Note {
  id: number;
  text: string;
  tag_id: number;
  tag?: Tag;
}
