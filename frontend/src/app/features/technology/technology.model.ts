export type TechnologyCategory = 'Techniques' | 'Tools' | 'Platforms' | 'Languages & Frameworks';
export type RadarRing = 'Assess' | 'Trial' | 'Adopt' | 'Hold';

export const TECHNOLOGY_CATEGORIES: TechnologyCategory[] = ['Techniques', 'Tools', 'Platforms', 'Languages & Frameworks'];
export const RADAR_RINGS: RadarRing[] = ['Assess', 'Trial', 'Adopt', 'Hold'];

export interface Technology {
  _id?: string;
  name: string;
  description: string;
  category: TechnologyCategory;
  ring: RadarRing;
  ringReason: string;
  published: boolean;
  publishedDate?: string;
}
