module.exports = ({ env }) => ({

    upload: {
  
      provider: 'azure-storage',
  
      providerOptions: {
  
        account: env('STORAGE_ACCOUNT','hdrive68138919024'),
  
        accountKey: env('STORAGE_ACCOUNT_KEY','35Z669bQLdih+niQRutUHPynwWD4UBjhHMddPTS1tNH0it+jNE0RTfNqZQNeF12cya6dppEELbUkSryVffY2vA=='),
  
        serviceBaseURL: env('STORAGE_URL'),
  
        containerName: env('STORAGE_CONTAINER_NAME','agastya-elearning'),
  
        defaultPath: 'assets',
  
        maxConcurrent: 10
  
      }
  
    }
  
  });