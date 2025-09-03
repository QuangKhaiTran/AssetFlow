// Next.js API proxy route to forward requests to Firebase Functions
// This resolves CORS issues and provides consistent API endpoints

async function proxyRequest(
  request: Request,
  endpoint: string
) {
  const firebaseFunctionsUrl = process.env.NODE_ENV === 'production' 
      ? 'https://us-central1-assetflow-p3qcd.cloudfunctions.net/api'
      : 'http://127.0.0.1:5003/assetflow-p3qcd/us-central1/api';
    
  const url = `${firebaseFunctionsUrl}/${endpoint}`;
  
  console.log(`Proxying ${request.method} request to: ${url}`);

  const body = request.method !== 'GET' && request.method !== 'DELETE' ? await request.text() : undefined;
  
  const response = await fetch(url, {
    method: request.method,
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
}

async function handleRequest(request: Request, { params }: { params: { slug: string[] } }) {
   try {
    const endpoint = params.slug.join('/');
    return await proxyRequest(request, endpoint);
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

export async function GET(
    request: Request,
    { params }: { params: { slug: string[] } }
) {
    return handleRequest(request, { params });
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, { params });
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, { params });
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string[] } }
) {
  return handleRequest(request, { params });
}
