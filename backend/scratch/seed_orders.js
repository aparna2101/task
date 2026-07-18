// Script to trigger backend dummy order seeding
const seedDummyOrders = async () => {
  console.log('Connecting to Order Management API to seed dummy orders...');
  try {
    const response = await fetch('http://localhost:5000/api/orders/seed-dummy', {
      method: 'POST'
    });
    const result = await response.json();
    
    if (response.ok) {
      console.log('SUCCESS: Dummy orders successfully seeded!');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error('ERROR: Failed to seed orders:', result.message);
    }
  } catch (error) {
    console.error('CONNECTION ERROR: Make sure the server is running on port 5000.', error.message);
  }
};

seedDummyOrders();
