const Joi = require('joi');

const articleSchema = Joi.object({
  dataset_id: Joi.number().integer().positive().required(),
  title: Joi.string().max(500).required(),
  published_at: Joi.string().isoDate().required(),
  views: Joi.number().integer().min(0).required(),
  time_on_page: Joi.number().integer().min(0).required(),
  conversions: Joi.number().integer().min(0).required(),
});

function validateArticle(req, res, next) {
  const { error } = articleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

module.exports = { validateArticle, articleSchema };
