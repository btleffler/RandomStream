
/*
 * GET home page.
 */

exports.index = function (req, res){
  res.render('index', { title: 'Random Stream' });
};

exports.browser = function (req, res) {
  res.render('browser', { title: 'Update Your Browser' });
};