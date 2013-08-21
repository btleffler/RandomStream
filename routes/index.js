
/*
 * GET home page.
 */

exports.index = function (req, res){
  res.render('index', { title: 'Random Stream', port: process.env.PORT || 3000 });
};

exports.browser = function (req, res) {
  res.render('browser', { title: 'Update Your Browser' });
};