import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getArticleBySlug, getFeaturedArticles } from '@/lib/contentful'
import { getImageUrl } from '@/utils/imageUtils'
import RichTextRenderer from '@/components/RichTextRenderer'
import ArticleCard from '@/components/ArticleCard'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return {
      title: 'Article Not Found | Burpee Garden Guide'
    }
  }

  return {
    title: article.fields.metaTitle || `${article.fields.title} | Burpee Garden Guide`,
    description: article.fields.metaDescription || `Learn about ${article.fields.title} with expert advice from Burpee.`,
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const [article, relatedArticles] = await Promise.all([
    getArticleBySlug(slug),
    getFeaturedArticles(3)
  ])

  if (!article) {
    notFound()
  }

  const { title, body, featuredImage, imageAlt, publishedAt } = article.fields
  const featuredImageUrl = featuredImage ? getImageUrl(featuredImage) : null

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="mb-4">
            <Link
              href="/articles"
              className="text-brand-green hover:text-brand-green/80 font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back to Articles
            </Link>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-medium text-gray-900 mb-4 font-reckless">
            {title}
          </h1>
          
          {publishedAt && (
            <time className="text-gray-500">
              Published {new Date(publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          )}
        </div>
      </div>

      {/* Featured Image */}
      {featuredImageUrl && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative h-96 w-full rounded-lg overflow-hidden">
            <Image
              src={featuredImageUrl}
              alt={imageAlt || title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <RichTextRenderer document={body} />
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-faded-green py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-medium text-gray-900 mb-8 font-reckless">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles
                .filter(relatedArticle => relatedArticle.sys.id !== article.sys.id)
                .slice(0, 3)
                .map((relatedArticle) => (
                  <ArticleCard key={relatedArticle.sys.id} article={relatedArticle} />
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}