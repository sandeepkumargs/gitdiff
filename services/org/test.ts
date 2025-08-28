// interface RegisterUserResponse {
//     // Define the expected shape of the response data
//     // Example fields (adjust according to your actual API response):
//     success: boolean;
//     message?: string;
//     [key: string]: any;
//   }
  
//   const registerUser = async (): Promise<RegisterUserResponse> => {
//     try {
//       const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWpheDJrMjFAZ21haWwuY29tIiwib3JnX2lkIjoiTWF5YW5rTW90b3JzXzZJWUtRYyIsImV4cCI6MTcyNzA3MTcwMn0.sIhD2unVRwWFbDnVWXh1BbcKHqKWqpaY8aBltJWlKBk";
//       const email = "prashantjoshi.rewa@gmail.com";
//       const scope = "organisation";
  
//       const response = await fetch('http://172.16.26.128:8080/org/api/v1/invite', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({ email, scope }),
//       });
  
//       if (!response.ok) {
//         throw new Error(`Failed to register user: ${response.statusText}`);
//       }
  
//       const data: RegisterUserResponse = await response.json();
//       return data;
//     } catch (error) {
//       console.error('Error in registerUser:', error);
//       throw error;
//     }
//   };
  
//   registerUser().then(data => {
//    
//   }).catch(error => {
//     // Optionally handle errors here
//     console.error('Error occurred:', error);
//   });


const fetchPortfolios = async () => {
    try {
      // Retrieve the token from localStorage
      const token = localStorage.getItem('refresh_token');
  
      const response = await fetch('http://172.16.26.128:8080/org/api/v1/portfolio/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWpheDJrMjFAZ21haWwuY29tIiwib3JnX2lkIjoiTWF5YW5rTW90b3JzXzZJWUtRYyIsImV4cCI6MTcyNzA3MTcwMn0.sIhD2unVRwWFbDnVWXh1BbcKHqKWqpaY8aBltJWlKBk`, 
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();

      
      
      return data.map((item: any) => ({
        id: item._id,
        title: item.name,
        description: item.description,
        projectCount: item.projects,
      }));
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      throw error;
    }
  };
  