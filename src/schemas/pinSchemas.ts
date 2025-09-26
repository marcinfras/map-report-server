import * as yup from 'yup';
import { PinType } from '../models/Pins.js';

export const createPinSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required('Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: yup
    .string()
    .trim()
    .required('Description is required')
    .max(500, 'Description must be less than 500 characters'),
  type: yup
    .string()
    .oneOf(Object.values(PinType), 'Invalid pin type')
    .required('Type is required'),
  lat: yup
    .number()
    .required('Latitude is required')
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude'),
  lng: yup
    .number()
    .required('Longitude is required')
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude'),
});

export const updatePinSchema = yup.object({
  title: yup
    .string()
    .trim()
    .max(100, 'Title must be less than 100 characters')
    .notRequired(),
  description: yup
    .string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .notRequired(),
  type: yup
    .string()
    .oneOf(Object.values(PinType), 'Invalid pin type')
    .notRequired(),
});
