import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export interface Post {
  id: string;
  title: string;
  summary: string;
  label?: string;
  author?: string;
  published?: string;
  url: string;
  image: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface Blog7Props {
  tagline?: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  onButtonClick?: () => void;
  posts?: Post[];
  hideHeader?: boolean;
}

const Blog7 = ({
  tagline = "Latest Updates",
  heading = "Blog Posts",
  description = "Discover the latest trends, tips, and best practices in modern web development. From UI components to design systems, stay updated with our expert insights.",
  buttonText = "View all articles",
  buttonUrl = "#",
  onButtonClick,
  posts = [],
  hideHeader = false,
}: Blog7Props) => {
  return (
    <section className={hideHeader ? "w-full" : "py-12 sm:py-16 w-full"}>
      <div className="w-full flex flex-col items-center gap-10">
        {!hideHeader && (
          <div className="text-center max-w-3xl mx-auto space-y-3">
            {tagline && (
              <Badge variant="secondary" className="mb-2 uppercase tracking-wider font-extrabold px-3 py-1 text-black bg-[#E6A500]">
                {tagline}
              </Badge>
            )}
            <h2 className="text-pretty text-2xl sm:text-3xl md:text-4xl font-extrabold text-black tracking-tight">
              {heading}
            </h2>
            {description && (
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {description}
              </p>
            )}
            {buttonText && (
              <div className="pt-2">
                {onButtonClick ? (
                  <Button
                    variant="link"
                    onClick={onButtonClick}
                    className="w-full sm:w-auto font-bold text-black hover:text-amber-600 cursor-pointer"
                  >
                    {buttonText}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                ) : (
                  <Button variant="link" className="w-full sm:w-auto font-bold text-black hover:text-amber-600" asChild>
                    <a href={buttonUrl}>
                      {buttonText}
                      <ArrowRight className="ml-2 size-4" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          {posts.map((post) => {
            const isExternal = post.url?.startsWith('http');
            const handleClick = (e: React.MouseEvent) => {
              if (post.onClick) {
                e.preventDefault();
                post.onClick(e);
              }
            };

            return (
              <Card
                key={post.id}
                className="grid grid-rows-[auto_auto_1fr_auto] overflow-hidden border border-gray-200 bg-white shadow-none rounded-2xl hover:border-black transition duration-200 group"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-100 relative">
                  <a
                    href={post.url}
                    onClick={handleClick}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="block w-full h-full transition-opacity duration-200 fade-in group-hover:opacity-90 cursor-pointer"
                  >
                    <img
                      src={post.image || "/media/public/images/projects/WATOTO.webp"}
                      alt={post.title}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                  {post.label && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase bg-[#E6A500] text-black rounded shadow-xs">
                        {post.label}
                      </span>
                    </div>
                  )}
                </div>

                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    {post.published && <span>{post.published}</span>}
                    {post.author && <span>{post.author}</span>}
                  </div>
                  <h3 className="text-lg font-bold text-black leading-snug group-hover:text-amber-700 transition">
                    <a
                      href={post.url}
                      onClick={handleClick}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="hover:underline cursor-pointer line-clamp-2"
                    >
                      {post.title}
                    </a>
                  </h3>
                </CardHeader>

                <CardContent className="p-5 pt-1">
                  <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <a
                    href={post.url}
                    onClick={handleClick}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="flex items-center text-xs font-extrabold uppercase tracking-wider text-black group-hover:text-amber-600 transition cursor-pointer"
                  >
                    Read more
                    <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { Blog7 };

