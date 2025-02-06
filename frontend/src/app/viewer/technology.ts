export interface Technology {
  name: string;
  description: string;
  category: 'Techniques' | 'Tools' | 'Platforms' | 'Languages & Frameworks';
  ring: 'Assess' | 'Trial' | 'Adopt' | 'Hold';
  published: boolean;
}