import author from "./author.js";
import logger from "./logger.js";

/**
 * @description Transform a post object from WordPress to the format defined by the elastic search index schema
 * @param {Object} post - The post object from WordPress API
 */
async function transform(post){
  if ( !post?.id ){
    return null;
  }
  const esPost = {
    postId: post.id,
    postType: post.type,
    title: post.title.rendered,
    excerpt: post.excerpt.rendered,
    content: post.content.rendered,
    menuOrder: post.menu_order || 0,
    updated: post.modified,
    created: post.date,
    link: post.link
  }

  // todo: handle forms
  if ( post.type === 'post') {
    esPost.type = 'news';
  } else {
    esPost.type = 'info-page';
  }

  if ( post.meta?.favoriteDefaultIcon ){
    esPost.icon = post.meta.favoriteDefaultIcon;
  }
  if ( post.meta?.favoriteDefaultIconColor ){
    esPost.iconBrandColor = post.meta.favoriteDefaultIconColor;
  }

  if ( post?.libraryGroup?.id ){
    esPost.libraryGroupIds = [post.libraryGroup.id];
  }
  if ( post?.libraryGroup?.name ){
    esPost.libraryGroupNames = [post.libraryGroup.name];
  }

  if ( post?.author && !post.meta?.ucd_hide_author ){
    esPost.authorIds = [post.author];
    try {
      const authorData = await author.get(post.author);
      esPost.authorNames = [authorData.name];
    } catch (error) {
      logger.warn({message: `Error fetching author`, error, postId: post.id});
    }
  }

  return esPost;

}

export default transform;
