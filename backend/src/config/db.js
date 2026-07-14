const mongoose = require('mongoose');
const dns = require('dns');

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/ai_customer_support';
const DEFAULT_DNS_SERVERS = ['8.8.8.8', '8.8.4.4', '1.1.1.1'];

const isMongoSrvUri = (uri) => uri?.trim().toLowerCase().startsWith('mongodb+srv://');

const configureMongoDns = (uri) => {
  if (!isMongoSrvUri(uri)) return;

  dns.setDefaultResultOrder?.('ipv4first');

  const configuredDns = process.env.MONGO_DNS_SERVERS;
  if (configuredDns?.trim().toLowerCase() === 'system') return;

  const dnsServers = configuredDns
    ? configuredDns.split(',').map((server) => server.trim()).filter(Boolean)
    : DEFAULT_DNS_SERVERS;

  if (dnsServers.length) {
    dns.setServers(dnsServers);
    console.log(`MongoDB SRV DNS resolvers: ${dnsServers.join(', ')}`);
  }
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
  const localFallbackUri = process.env.MONGO_LOCAL_FALLBACK_URI || DEFAULT_MONGO_URI;
  const connectOptions = {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    family: 4,
  };

  configureMongoDns(uri);

  try {
    const conn = await mongoose.connect(uri, connectOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB primary connection failed: ${error.message}`);

    if (uri === localFallbackUri) {
      console.error('\n==================================================================');
      console.error('[DATABASE CONNECTIVITY ERROR]');
      console.error('Local MongoDB is unavailable.');
      console.error('Launch local MongoDB server (mongod) or configure MONGO_URI.');
      console.error('Demo fallback API is active until MongoDB becomes reachable.');
      console.error('==================================================================\n');
      return;
    }

    console.log(`Attempting local MongoDB fallback connection (${localFallbackUri})...`);
    try {
      const localConn = await mongoose.connect(localFallbackUri, connectOptions);
      console.log(`Local MongoDB Fallback Connected: ${localConn.connection.host}`);
    } catch (localErr) {
      console.error(`Local MongoDB Connection failed: ${localErr.message}`);
      console.error('\n==================================================================');
      console.error('[DATABASE CONNECTIVITY ERROR]');
      console.error('MongoDB Atlas DNS querySrv timed out or local MongoDB is unavailable.');
      console.error('Workaround options:');
      console.error('1) Set MONGO_DNS_SERVERS=8.8.8.8,8.8.4.4 or MONGO_DNS_SERVERS=1.1.1.1,1.0.0.1.');
      console.error('2) Configure Windows network IPv4 DNS to Google DNS or Cloudflare DNS.');
      console.error('3) Connect to a different network or mobile hotspot.');
      console.error('4) Launch local MongoDB server (mongod) on port 27017.');
      console.error('Demo fallback API is active until MongoDB becomes reachable.');
      console.error('==================================================================\n');
    }
  }
};

module.exports = connectDB;
