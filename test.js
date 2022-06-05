const productTags = [1,2,3,4];
const req ={
    body: {
        tagIds:[5,3,9,1],
    },
};
const productTagIds = productTags;
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
           // product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(( tag_id ) => !req.body.tagIds.includes(tag_id))
        .map(( id ) => id);
console.log(newProductTags,'\n',productTagsToRemove);