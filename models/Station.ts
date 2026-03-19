import mongoose from 'mongoose';

const FuelTypeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  status: { type: String, enum: ['available', 'limited', 'unavailable'], default: 'unavailable' },
  price: { type: Number, required: true }
}, { _id: false });

const StationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  fuelTypes: [FuelTypeSchema],
  lastUpdated: { type: Date, default: Date.now },
  reportCount: { type: Number, default: 0 }
});

// Virtual for ID compatibility with frontend expectancies
StationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export default mongoose.models.Station || mongoose.model('Station', StationSchema);
