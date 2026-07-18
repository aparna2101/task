// Script to trigger backend scheduler execution
const triggerScheduler = async (apiKey = 'super_secret_scheduler_key_123') => {
  console.log(`Triggering scheduler with key: "${apiKey}"...`);
  try {
    const response = await fetch('http://localhost:5000/api/scheduler/run', {
      method: 'POST',
      headers: {
        'x-scheduler-key': apiKey
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('SUCCESS: Scheduler executed successfully!');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error(`ERROR (Status ${response.status}):`, result.message);
    }
  } catch (error) {
    console.error('CONNECTION ERROR: Make sure the server is running on port 5000.', error.message);
  }
};

// Check if an argument was passed for custom key test
const customKey = process.argv[2];
triggerScheduler(customKey);
