require('dotenv').config();

const methodOverride = require('method-override');
const errorHandler = require('errorhandler');
const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');

const path = require('path');
const app = express();
const port = 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(errorHandler());
app.use(logger('dev'));

const Prismic = require('@prismicio/client');
const PrismicDOM = require('prismic-dom');

const initApi = (req) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req
  });
};

const handleLinkResolver = (doc) => {
  return doc.type === 'product'
    ? `/detail/${doc.slug}`
    : doc.type === 'about'
    ? '/about'
    : doc.type === 'collections'
    ? '/collections'
    : '/';
};

app.use((req, res, next) => {
  res.locals.Link = handleLinkResolver;

  res.locals.Numbers = (index) =>
    index == 0
      ? 'One'
      : index == 1
      ? 'Two'
      : index == 2
      ? 'Three'
      : index == 3 && 'Four';

  res.locals.PrismicDOM = PrismicDOM;

  next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const handleRequest = async (api) => {
  const navigation = await api.getSingle('navigation');
  const preloader = await api.getSingle('preloader');
  const meta = await api.getSingle('meta');

  return {
    meta,
    navigation,
    preloader
  };
};

app.get('/', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  const home = await api.getSingle('home');

  const { results: collections } = await api.query(
    Prismic.Predicates.at('document.type', 'collection'),
    {
      fetchLinks: 'product.image'
    }
  );

  res.render('pages/home', {
    ...defaults,
    home,
    collections
  });
});

app.get('/about', async (req, res) => {
  const about = await api.getSingle('about');
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  res.render('pages/about', {
    ...defaults,
    about
  });
});

app.get('/collections', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);
  const home = await api.getSingle('home');

  const { results: collections } = await api.query(
    Prismic.Predicates.at('document.type', 'collection'),
    {
      fetchLinks: 'product.image'
    }
  );

  res.render('pages/collections', {
    ...defaults,
    collections,
    home
  });
});

app.get('/detail/:uid', async (req, res) => {
  const api = await initApsi(req);
  const defaults = await handleRequest(api);

  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title'
  });

  res.render('pages/detail', {
    ...defaults,
    product
  });
});

app.listen(port, () => {
  console.log(`Server started at port: ${port}`);
});
