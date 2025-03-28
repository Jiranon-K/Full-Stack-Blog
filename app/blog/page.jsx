import React from 'react'
import AllBlogPostGrid from '../components/AllBlogPostCard'

export default async function BlogPage({ searchParams }) {
  
  const resolvedSearchParams = await searchParams;
  
 
  const category = (resolvedSearchParams?.category) ?? '';
  const page = Number(resolvedSearchParams?.page ?? 1);

  return (
    <div>
      <AllBlogPostGrid 
        searchParams={{
          category,
          page
        }} 
      />
     
    </div>
  )
}