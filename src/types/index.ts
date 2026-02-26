export interface Citizen {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: Date;
}

export interface Issue {
  issueId: string;
  userId: string;
  imageUrl: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  status: 'Pending' | 'In Progress' | 'Resolved';
  upvotes: number;
  assignedWorker: string;
  createdAt: Date;
  updatedAt: Date;
  userName: string;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export type FilterStatus = 'All' | 'Pending' | 'In Progress' | 'Resolved';
export type FilterCategory =
  | 'All'
  | 'Pothole'
  | 'Garbage'
  | 'Street Light'
  | 'Water Leak'
  | 'Road Damage'
  | 'Other';
