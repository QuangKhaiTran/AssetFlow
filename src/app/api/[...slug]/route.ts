// Next.js API proxy route to forward requests to Firebase Functions
// This resolves CORS issues and provides consistent API endpoints

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const body = await request.text();
    const resolvedParams = await params;
    const endpoint = resolvedParams.slug.join('/');
    
    // Get Firebase Functions URL based on environment
    const firebaseFunctionsUrl = process.env.NODE_ENV === 'production' 
      ? 'https://us-central1-assetflow-p3qcd.cloudfunctions.net/api'
      : 'http://127.0.0.1:5003/assetflow-p3qcd/us-central1/api';
    
    const url = `${firebaseFunctionsUrl}/${endpoint}`;
    
    console.log(`Proxying POST request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Firebase Functions error: ${response.status} - ${errorText}`);
      return new Response(errorText, { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const responseData = await response.text();
    return new Response(responseData, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API Proxy Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal proxy error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const body = await request.text();
    const resolvedParams = await params;
    const endpoint = resolvedParams.slug.join('/');
    
    // Get Firebase Functions URL based on environment
    const firebaseFunctionsUrl = process.env.NODE_ENV === 'production' 
      ? 'https://us-central1-assetflow-p3qcd.cloudfunctions.net/api'
      : 'http://127.0.0.1:5003/assetflow-p3qcd/us-central1/api';
    
    const url = `${firebaseFunctionsUrl}/${endpoint}`;
    
    console.log(`Proxying PUT request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Firebase Functions error: ${response.status} - ${errorText}`);
      return new Response(errorText, { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const responseData = await response.text();
    return new Response(responseData, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API Proxy Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal proxy error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}