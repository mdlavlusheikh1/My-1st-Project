# Quick command to update user to super admin
# Run this in your terminal after setting up Firebase CLI

firebase firestore:write users/ndrZqsqNWmZ5Hq1fDVYvCNFQKs72 '{
  "role": "super_admin",
  "schoolId": "all", 
  "schoolName": "System Administrator",
  "isActive": true,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}' --project iqna-landing