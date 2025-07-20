import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    // Determine which MongoDB URI to use based on NODE_ENV
    // If NODE_ENV is 'test', use MONGO_TEST_URL. Otherwise, use MONGO_URL.
    const mongoURI = process.env.NODE_ENV === 'test'
      ? process.env.MONGO_TEST_URL
      : process.env.MONGO_URL;

    // Log the chosen URI for debugging purposes
    console.log(`Attempting to connect to MongoDB. Environment: ${process.env.NODE_ENV || 'development'}. Using URI: ${mongoURI ? mongoURI.substring(0, mongoURI.indexOf('@') + 1) + '...' : 'Not defined'}`);

    // Ensure a MongoDB URI is defined before attempting to connect
    if (!mongoURI) {
      console.error("MongoDB URI is not defined for the current environment. Please check your .env file.");
      process.exit(1); // Exit the process if the URI is missing
    }

    // Connect to MongoDB using the selected URI
    await mongoose.connect(mongoURI, {
      // These options are often included for compatibility, though newer Mongoose versions may not require them
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // Add a timeout for server selection to prevent indefinite hanging
      serverSelectionTimeoutMS: 60000, // 60 seconds
    });

    console.log(`MongoDB Connected: ${mongoose.connection.host} to database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`Error in connecting DB: ${error.message}`);
    process.exit(1); // Exit the process with an error code
  }
};

export default connectDatabase;
