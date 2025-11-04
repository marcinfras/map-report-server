import type { IPin } from '@models/Pins.js';
import type { ApiProfile } from '../auth/types.js';
export type MyPin = Omit<IPin, '_id' | 'author' | 'createdAt'> & {
    id: string;
    author: string;
    createdAt: string;
};
export type PinDetails = Omit<IPin, '_id' | 'author' | 'createdAt' | 'updatedAt'> & {
    id: string;
    author: Pick<ApiProfile, 'id' | 'fullName'>;
    createdAt: string;
    updatedAt?: string;
};
export type AdminPin = Omit<IPin, '_id' | 'author' | 'createdAt' | 'updatedAt'> & {
    id: string;
    author: Pick<ApiProfile, 'fullName'>;
    createdAt: string;
};
export type MapPin = Pick<IPin, 'type' | 'coordinates'> & {
    id: string;
};
export type Pagination = {
    total: number;
    totalPages: number;
};
export type listMyPins = {
    pins: MyPin[];
    pagination: Pagination;
};
export type listAdminPins = {
    pins: AdminPin[];
    pagination: Pagination;
};
//# sourceMappingURL=types.d.ts.map