import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../../infrastructure/storage/auth-store';

export default function ApiDocsPage() {
  const { accessToken } = useAuthStore();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-muted-foreground">
          Complete API reference for integrating with the User Management System
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Base URL</CardTitle>
          <CardDescription>The base URL for all API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <code className="text-sm font-mono">https://auth.cloudecage.com/api/v1</code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard('https://auth.cloudecage.com/api/v1')}
            >
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>How to authenticate API requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Bearer Token</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Include the access token in the Authorization header:
            </p>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <code className="text-sm font-mono">Authorization: Bearer {accessToken?.slice(0, 20)}...</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(`Authorization: Bearer ${accessToken || 'YOUR_TOKEN'}`)}
              >
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Authentication Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">POST</span>
                <code className="text-sm">/auth/onboard</code>
              </div>
              <p className="text-xs text-muted-foreground">Initialize system (one-time only)</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">POST</span>
                <code className="text-sm">/auth/register</code>
              </div>
              <p className="text-xs text-muted-foreground">Register new tenant</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">POST</span>
                <code className="text-sm">/auth/login</code>
              </div>
              <p className="text-xs text-muted-foreground">User login</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">POST</span>
                <code className="text-sm">/auth/refresh</code>
              </div>
              <p className="text-xs text-muted-foreground">Refresh access token</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">POST</span>
                <code className="text-sm">/auth/logout</code>
              </div>
              <p className="text-xs text-muted-foreground">Logout user</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">POST</span>
                <code className="text-sm">/auth/validate</code>
              </div>
              <p className="text-xs text-muted-foreground">Validate token and get user info</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">GET</span>
                <code className="text-sm">/users</code>
              </div>
              <p className="text-xs text-muted-foreground">List all users with roles and permissions</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">GET</span>
                <code className="text-sm">/users/:id</code>
              </div>
              <p className="text-xs text-muted-foreground">Get user details with roles and permissions</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">POST</span>
                <code className="text-sm">/users</code>
              </div>
              <p className="text-xs text-muted-foreground">Create new user with role assignments</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-mono">PUT</span>
                <code className="text-sm">/users/:id</code>
              </div>
              <p className="text-xs text-muted-foreground">Update user info and assign/edit roles</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">DELETE</span>
                <code className="text-sm">/users/:id</code>
              </div>
              <p className="text-xs text-muted-foreground">Delete user</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">GET</span>
                <code className="text-sm">/roles</code>
              </div>
              <p className="text-xs text-muted-foreground">List all roles with permissions</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">GET</span>
                <code className="text-sm">/roles/:id</code>
              </div>
              <p className="text-xs text-muted-foreground">Get role details with permissions</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">POST</span>
                <code className="text-sm">/roles</code>
              </div>
              <p className="text-xs text-muted-foreground">Create new role with permission assignments</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-mono">PUT</span>
                <code className="text-sm">/roles/:id</code>
              </div>
              <p className="text-xs text-muted-foreground">Update role and edit permissions</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">DELETE</span>
                <code className="text-sm">/roles/:id</code>
              </div>
              <p className="text-xs text-muted-foreground">Delete role</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">POST</span>
                <code className="text-sm">/roles/tenant/:tenantId</code>
              </div>
              <p className="text-xs text-muted-foreground">Create role for specific tenant (Super Admin)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">GET</span>
                <code className="text-sm">/permissions</code>
              </div>
              <p className="text-xs text-muted-foreground">List all permissions</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">POST</span>
                <code className="text-sm">/permissions</code>
              </div>
              <p className="text-xs text-muted-foreground">Create new permission (Super Admin)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Tenant Management (Super Admin)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">GET</span>
                <code className="text-sm">/tenants</code>
              </div>
              <p className="text-xs text-muted-foreground">List all tenants</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">POST</span>
                <code className="text-sm">/tenants</code>
              </div>
              <p className="text-xs text-muted-foreground">Create new tenant with admin user</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-mono">PUT</span>
                <code className="text-sm">/tenants/:id</code>
              </div>
              <p className="text-xs text-muted-foreground">Update tenant information</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">DELETE</span>
                <code className="text-sm">/tenants/:id</code>
              </div>
              <p className="text-xs text-muted-foreground">Delete tenant and all associated data</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>Example code for common operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">JavaScript/TypeScript (Fetch)</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`// Login
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123',
    tenantSlug: 'my-org'
  })
});
const data = await response.json();
const { accessToken } = data.results;

// Validate Token
const validateResponse = await fetch('http://localhost:3000/api/v1/auth/validate', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${accessToken}\`,
    'Content-Type': 'application/json'
  }
});
const validateData = await validateResponse.json();
if (validateData.success && validateData.results.valid) {
  console.log('Token is valid', validateData.results.user);
} else {
  console.log('Token is invalid or expired:', validateData.message);
}

// Get Users
const usersResponse = await fetch('http://localhost:3000/api/v1/users', {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
});
const usersData = await usersResponse.json();
const users = usersData.results;`}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => copyToClipboard(`// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123',
    tenantSlug: 'my-org'
  })
});
const data = await response.json();
const { accessToken } = data.results;

// Get Users
const usersResponse = await fetch('http://localhost:3000/api/v1/users', {
  headers: {
    'Authorization': \`Bearer \${accessToken}\`
  }
});
const usersData = await usersResponse.json();
const users = usersData.results;`)}
            >
              Copy Code
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Python (requests)</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import requests

BASE_URL = "http://localhost:3000/api/v1"

# Login
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "user@example.com", "password": "SecurePass123", "tenantSlug": "my-org"}
)
data = response.json()
access_token = data["results"]["accessToken"]

# Validate Token
validate_response = requests.post(
    f"{BASE_URL}/auth/validate",
    headers={"Authorization": f"Bearer {access_token}"}
)
validate_data = validate_response.json()
if validate_data["success"] and validate_data["results"]["valid"]:
    print("Token is valid", validate_data["results"]["user"])
else:
    print("Token is invalid or expired:", validate_data["message"])

# Get Users
users_response = requests.get(
    f"{BASE_URL}/users",
    headers={"Authorization": f"Bearer {access_token}"}
)
users = users_response.json()["results"]`}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => copyToClipboard(`import requests

BASE_URL = "http://localhost:3000/api/v1"

# Login
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "user@example.com", "password": "SecurePass123", "tenantSlug": "my-org"}
)
data = response.json()
access_token = data["results"]["accessToken"]

# Get Users
users_response = requests.get(
    f"{BASE_URL}/users",
    headers={"Authorization": f"Bearer {access_token}"}
)
users = users_response.json()["results"]`)}
            >
              Copy Code
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">cURL</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`# Login
curl -X POST http://localhost:3000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"SecurePass123","tenantSlug":"my-org"}'

# Validate Token (replace TOKEN with actual token)
curl -X POST http://localhost:3000/api/v1/auth/validate \\
  -H "Authorization: Bearer TOKEN"

# Alternative: Validate token via request body
curl -X POST http://localhost:3000/api/v1/auth/validate \\
  -H "Content-Type: application/json" \\
  -d '{"token":"TOKEN"}'

# Get Users (replace TOKEN with actual token)
curl -X GET http://localhost:3000/api/v1/users \\
  -H "Authorization: Bearer TOKEN"`}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => copyToClipboard(`# Login
curl -X POST http://localhost:3000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"SecurePass123","tenantSlug":"my-org"}'

# Get Users (replace TOKEN with actual token)
curl -X GET http://localhost:3000/api/v1/users \\
  -H "Authorization: Bearer TOKEN"`)}
            >
              Copy Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Response Format</CardTitle>
          <CardDescription>Standard API response structure</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`{
  "success": boolean,
  "message": string,
  "statusCode": number,
  "errors": string[],
  "stackTrace": string[],
  "results": any
}`}</code>
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => copyToClipboard(`{
  "success": boolean,
  "message": string,
  "statusCode": number,
  "errors": string[],
  "stackTrace": string[],
  "results": any
}`)}
          >
            Copy Format
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Token Validation Endpoint</CardTitle>
          <CardDescription>Validate tokens and handle all authentication scenarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Endpoint</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">POST</span>
              <code className="text-sm">/api/auth/validate</code>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Validates a JWT token and returns user information if valid. Handles all token validation scenarios.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Request Methods</h3>
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Method 1: Authorization Header</p>
                <code className="text-xs">Authorization: Bearer &lt;token&gt;</code>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Method 2: Request Body</p>
                <code className="text-xs">{`{ "token": "<token>" }`}</code>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Response Scenarios</h3>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Valid Token</span>
                  <span className="text-xs text-muted-foreground">200 OK</span>
                </div>
                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                  <code>{`{
  "success": true,
  "message": "Token is valid",
  "statusCode": 200,
  "results": {
    "valid": true,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "tenantId": "tenant-uuid",
      "roles": ["admin"],
      "permissions": ["user.create", "user.read"],
      "isSuperAdmin": false
    },
    "message": "Token is valid"
  }
}`}</code>
                </pre>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Expired Token</span>
                  <span className="text-xs text-muted-foreground">401 Unauthorized</span>
                </div>
                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                  <code>{`{
  "success": false,
  "message": "Token has expired",
  "statusCode": 401,
  "errors": ["Token has expired"],
  "results": {
    "valid": false,
    "expired": true,
    "message": "Token has expired"
  }
}`}</code>
                </pre>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Invalid Token</span>
                  <span className="text-xs text-muted-foreground">400 Bad Request</span>
                </div>
                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                  <code>{`{
  "success": false,
  "message": "Token signature is invalid",
  "statusCode": 400,
  "errors": ["Token signature is invalid"],
  "results": {
    "valid": false,
    "invalid": true,
    "message": "Token signature is invalid"
  }
}`}</code>
                </pre>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Missing Token</span>
                  <span className="text-xs text-muted-foreground">400 Bad Request</span>
                </div>
                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                  <code>{`{
  "success": false,
  "message": "Token is required",
  "statusCode": 400,
  "errors": ["Token must be provided in Authorization header (Bearer token) or request body"]
}`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Use Cases</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Check if a stored token is still valid before making API calls</li>
              <li>Get current user information without making a separate request</li>
              <li>Handle token expiration gracefully in your application</li>
              <li>Verify token validity after page refresh or app restart</li>
              <li>Implement automatic token refresh based on validation results</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Interactive API Documentation</div>
              <div className="text-sm text-muted-foreground">Swagger UI v1 at /api-docs/v1</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('http://localhost:3000/api-docs/v1', '_blank')}
            >
              Open Swagger v1
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Latest API Documentation</div>
              <div className="text-sm text-muted-foreground">Swagger UI Latest at /api-docs/latest</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('http://localhost:3000/api-docs/latest', '_blank')}
            >
              Open Swagger Latest
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Postman Collection</div>
              <div className="text-sm text-muted-foreground">Import from backend/docs/postman-collection.json</div>
              <div className="text-xs text-muted-foreground mt-1">
                Includes automatic token management - tokens are saved automatically after login
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard('backend/docs/postman-collection.json')}
            >
              Copy Path
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Postman Environment</div>
              <div className="text-sm text-muted-foreground">Import from backend/docs/postman-environment.json</div>
              <div className="text-xs text-muted-foreground mt-1">
                Pre-configured environment variables for easy testing
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard('backend/docs/postman-environment.json')}
            >
              Copy Path
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

