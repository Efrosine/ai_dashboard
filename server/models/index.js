// Index file to export all models
const ScrapedData = require("./ScrapedData");
const ScrapedResult = require("./ScrapedResult");
const SuspectedAccounts = require("./SuspectedAccounts");
const Locations = require("./Locations");
const SocialDetectionResults = require("./SocialDetectionResults");
const CCTV = require("./CCTV");
const CCTVDetectionResults = require("./CCTVDetectionResults");
const DummyAccounts = require("./DummyAccounts");
const Users = require("./Users");
const ScrapedDataResult = require("./ScrapedDataResult");

// Export all models in the order they should be created (respecting foreign key dependencies)
module.exports = {
  // Base tables first (no foreign keys)
  ScrapedData,
  ScrapedResult,
  SuspectedAccounts,
  Locations,
  CCTV,
  DummyAccounts,
  Users,
  // Tables with foreign keys second
  SocialDetectionResults,
  CCTVDetectionResults,
  ScrapedDataResult,

  // Helper function to get models in creation order
  getCreationOrder: () => [
    ScrapedData,
    ScrapedResult,
    SuspectedAccounts,
    Locations,
    CCTV,
    DummyAccounts,
    Users,
    SocialDetectionResults,
    CCTVDetectionResults,
    ScrapedDataResult,
  ],

  // Helper function to get models in reverse order for dropping
  getDropOrder: () => [
    ScrapedDataResult,
    CCTVDetectionResults,
    SocialDetectionResults,
    Users,
    DummyAccounts,
    CCTV,
    Locations,
    SuspectedAccounts,
    ScrapedResult,
    ScrapedData,
  ],
};
