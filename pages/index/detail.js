//index.js
//获取应用实例
const app = getApp();

Page({
  data: {
    movie: {
      title: "Loading...",
    },
    items: [{ id: 1, text: "Loading..." }],
    products: [],
    scrollInto: "",
    inputVal: "",
    inputRating: 1,
    userInfo: null,
  },
  onLoad: function (options) {
    // get currentUser information
    const userInfo = wx.getStorageSync("userInfo");

    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      });
    }

    const Movies = new wx.BaaS.TableObject("movies");
    const MovieReviews = new wx.BaaS.TableObject("movie_reviews");

    const MovieProducts = new wx.BaaS.TableObject("movie_products");

    // console.log("detail page options", options);

    // Getting a single movie by id (options.id)
    Movies.get(options.id).then((res) => {
      // console.log("detail page result", res);
      this.setData({
        movie: res.data,
      });
    });

    // Getting all the reviews with movie_id == options.id
    // set up the query
    let query = new wx.BaaS.Query();

    query.compare("movieId", "=", options.id);

    // grab the information from movie_reviews table
    MovieReviews.setQuery(query)
      .find()
      .then((res) => {
        // console.log("result from movie reviews query find", res);
        this.setData({
          items: res.data.objects,
        });
      });


    // Get All Movie Products
    const productQuery = new wx.BaaS.Query();

    productQuery.compare('movieId', '=', options.id);

    MovieProducts.setQuery(productQuery).find().then((res) => {
      this.setData({
        products: res.data.objects,
      })
    }, (err) => {
      console.log('product get error', err);
    })
    
  },
  inputChange: function (e) {
    this.setData({
      inputVal: e.detail.value,
    });
  },
  formReset: function () {
    const val = this.data.inputVal;

    if (val.trim() === "") return;

    // get the movie_reviews table
    const Reviews = new wx.BaaS.TableObject("movie_reviews");

    // step 1: create a blank record
    const newReview = Reviews.create();

    // step 2: set the information in the record
    newReview.set({
      text: val,
      rating: this.data.inputRating,
      movieId: this.data.movie.id,
    });

    // send the record to ifanr to save in the database
    newReview.save().then(
      (res) => {
        console.log("newReview save", res);
        const newItems = this.data.items;
        newItems.push(res.data);
        this.setData({
          items: newItems,
        });
      },
      (error) => {
        console.log("newReview save error, error");
      }
    );

    this.setData({
      inputVal: "",
    });
  },
  userInfoHandler: function (data) {
    wx.BaaS.auth.loginWithWechat(data).then(
      (res) => {
        // user login successful, user authorized
        this.setData({
          userInfo: res,
        });

        // save the userInfo inside of our phone storage
        wx.setStorageSync("userInfo", res);
      },
      (err) => {
        console.log("login error", err);
      }
    );
  },
  onRatingChange: function (e) {
    this.setData({
      inputRating: Number.parseInt(e.detail.value),
    });
  },

  placeOrder: function(e) {
    const productId = e.currentTarget.id;

    const MovieOrder = new wx.BaaS.TableObject('movie_orders');

    const newOrder = MovieOrder.create();

    newOrder.set({
      productId: productId
    });

    newOrder.save().then((res) => {
      wx.showModal({
        title: 'Success!',
        content: 'The product was ordered!',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#3CC51F',
      });
    }, (err) => {
      wx.showModal({
        title: 'Fail!',
        content: 'There was a problem.',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#3CC51F',
      });
    })
  }
});
