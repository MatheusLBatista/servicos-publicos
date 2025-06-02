export default  {
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  "coveragePathIgnorePatterns": [
      "/node_modules/",
      "/src/utils/helpers/index.js",
      "/utils/logger.js",
      "/utils/errors",
      "/utils/helpers/errorHandler.js",
      "/utils/helpers/StatusService.js",
      "/utils/helpers/messages.js",
      "/utils/helpers/CommonResponse.js",
      "/middlewares/asyncWrapper.js",
      "utils/helpers/CustomError.js",
      "utils/helpers/HttpStatusCodes.js"
    ]

};