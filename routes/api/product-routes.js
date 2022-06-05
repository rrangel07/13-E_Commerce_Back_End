const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  try {
    const productData = await Product.findAll({
      // be sure to include its associated Category and Tag data
      include: [{ model: Category },{ model: Tag }],
      order: [['id', 'ASC']]
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  try {
    const productData = await Product.findByPk(req.params.id,{
      // be sure to include its associated Category and Tag data
      include: [{ model: Category },{ model: Tag }],
    });
    if(!productData){
      res.status(404).json({ message: 'No product with this id!' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      category_id: 
      tag_id: [1, 2, 3, 4]
    }
  */
    try {
      const productData = await Product.create(req.body);
      if (req.body.tag_id.length) {
        const productTagIdArr = req.body.tag_id.map((tag_id) => {
          return {
            product_id: productData.id,
            tag_id,
          };
        });
        await ProductTag.bulkCreate(productTagIdArr);
      }
      res.status(200).json(productData);
    } catch (err) {
      res.status(500).json(err);
    }
});

// update product
router.put('/:id', async (req, res) => {
  // update product data
  try {
    const productData = await Product.update(req.body, 
    {
      where: {
        id: req.params.id,
      },
    });
    if(req.body.tag_id && productData[0]){
      // find all associated tags from ProductTag
      const productTagData = await ProductTag.findAll({ 
        where: { product_id: req.params.id }
      });
      // get list of current tag_ids
      const productTagIds = productTagData.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tag_id
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTagData
        .filter(({ tag_id }) => !req.body.tag_id.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      const updatedProducts = await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    if (!productData[0]){
      res.status(404).json({ message: 'Nothing to update' });
      return;
    }
    res.status(200).json(productData);
  } catch(err) {
      res.status(500).json(err); 
  }
});



router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy(
    {
      where: 
      {
        id: req.params.id,
      },
    });
    console.log(productData);
    if(!productData){
      res.status(400).json({ message: 'Nothing to delete' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
