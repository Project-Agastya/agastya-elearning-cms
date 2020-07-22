module.exports = ({ env }) => ({

    upload: {
  
      provider: 'azure-storage',
  
      providerOptions: {
  
        account: env('STORAGE_ACCOUNT','agastya'),
  
        accountKey: env('STORAGE_ACCOUNT_KEY','VGM9rfCXtmESSCQUerjcieH5L5prQEoDzOYd9w6LlsPJdUoEWJWOCbw4vepAKjcKL43sXlbOB2Wc9ti02622Xg=='),
  
        serviceBaseURL: env('STORAGE_URL'),
  
        containerName: env('STORAGE_CONTAINER_NAME','agastya'),
  
        defaultPath: 'assets',
  
        maxConcurrent: 10
  
      }
  
    }
  
  });