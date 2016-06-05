'use strict';
const fs = require('fs');
const crypto = require('crypto');
const _ = require('lodash');
const async = require('async');
const imageSize = require('image-size');
const error = require('./error');
const helper = require('./helper');

const experiments = 'ig_android_progressive_jpeg,ig_creation_growth_holdout,ig_android_report_and_hide,ig_android_new_browser,ig_android_enable_share_to_whatsapp,ig_android_direct_drawing_in_quick_cam_universe,ig_android_huawei_app_badging,ig_android_universe_video_production,ig_android_asus_app_badging,ig_android_direct_plus_button,ig_android_ads_heatmap_overlay_universe,ig_android_http_stack_experiment_2016,ig_android_infinite_scrolling,ig_fbns_blocked,ig_android_white_out_universe,ig_android_full_people_card_in_user_list,ig_android_post_auto_retry_v7_21,ig_fbns_push,ig_android_feed_pill,ig_android_profile_link_iab,ig_explore_v3_us_holdout,ig_android_histogram_reporter,ig_android_anrwatchdog,ig_android_search_client_matching,ig_android_high_res_upload_2,ig_android_new_browser_pre_kitkat,ig_android_2fac,ig_android_grid_video_icon,ig_android_white_camera_universe,ig_android_disable_chroma_subsampling,ig_android_share_spinner,ig_android_explore_people_feed_icon,ig_explore_v3_android_universe,ig_android_media_favorites,ig_android_nux_holdout,ig_android_search_null_state,ig_android_react_native_notification_setting,ig_android_ads_indicator_change_universe,ig_android_video_loading_behavior,ig_android_black_camera_tab,liger_instagram_android_univ,ig_explore_v3_internal,ig_android_direct_emoji_picker,ig_android_prefetch_explore_delay_time,ig_android_business_insights_qe,ig_android_direct_media_size,ig_android_enable_client_share,ig_android_promoted_posts,ig_android_app_badging_holdout,ig_android_ads_cta_universe,ig_android_mini_inbox_2,ig_android_feed_reshare_button_nux,ig_android_boomerang_feed_attribution,ig_android_fbinvite_qe,ig_fbns_shared,ig_android_direct_full_width_media,ig_android_hscroll_profile_chaining,ig_android_feed_unit_footer,ig_android_media_tighten_space,ig_android_private_follow_request,ig_android_inline_gallery_backoff_hours_universe,ig_android_direct_thread_ui_rewrite,ig_android_rendering_controls,ig_android_ads_full_width_cta_universe,ig_video_max_duration_qe_preuniverse,ig_android_prefetch_explore_expire_time,ig_timestamp_public_test,ig_android_profile,ig_android_dv2_consistent_http_realtime_response,ig_android_enable_share_to_messenger,ig_explore_v3,ig_ranking_following,ig_android_pending_request_search_bar,ig_android_feed_ufi_redesign,ig_android_video_pause_logging_fix,ig_android_default_folder_to_camera,ig_android_video_stitching_7_23,ig_android_profanity_filter,ig_android_business_profile_qe,ig_android_search,ig_android_boomerang_entry,ig_android_inline_gallery_universe,ig_android_ads_overlay_design_universe,ig_android_options_app_invite,ig_android_view_count_decouple_likes_universe,ig_android_periodic_analytics_upload_v2,ig_android_feed_unit_hscroll_auto_advance,ig_peek_profile_photo_universe,ig_android_ads_holdout_universe,ig_android_prefetch_explore,ig_android_direct_bubble_icon,ig_video_use_sve_universe,ig_android_inline_gallery_no_backoff_on_launch_universe,ig_android_image_cache_multi_queue,ig_android_camera_nux,ig_android_immersive_viewer,ig_android_dense_feed_unit_cards,ig_android_sqlite_dev,ig_android_exoplayer,ig_android_add_to_last_post,ig_android_direct_public_threads,ig_android_prefetch_venue_in_composer,ig_android_bigger_share_button,ig_android_dv2_realtime_private_share,ig_android_non_square_first,ig_android_video_interleaved_v2,ig_android_follow_search_bar,ig_android_last_edits,ig_android_video_download_logging,ig_android_ads_loop_count_universe,ig_android_swipeable_filters_blacklist,ig_android_boomerang_layout_white_out_universe,ig_android_ads_carousel_multi_row_universe,ig_android_mentions_invite_v2,ig_android_direct_mention_qe,ig_android_following_follower_social_context';

class InstaNode {
  constructor (username, password) {
    this.username = username;
    this.password = password;
    this.userSignature = {};
    if (username && password) {
      this.uuid = helper.generateUUID(true);
      this.device_id = helper.generateDeviceId(crypto.createHash('md5').update(username + password).digest('hex'));
    }
  }
  
  login (username, password, callback) {
    if (typeof username === 'function') {
      callback = username;
      username = this.username;
      password = this.password;
    }

    if (!username || !password) {
      return callback && callback(new error(error.err.wrong_user_credentials));
    }
    let uuid = this.uuid;
    let device_id = this.device_id;
    if (!uuid) {
      uuid = helper.generateUUID(true);
      device_id = helper.generateDeviceId(crypto.createHash('md5').update(username + password).digest('hex'));
    }
    
    // Getting request token
    helper.apiCall('/si/fetch_headers/?challenge_type=signup&guid=' + helper.generateUUID(false), (err, data, res) => {
      if (!res || !res.headers['set-cookie'] || !res.headers['set-cookie'].length) {
        return callback && callback(new error(error.err.api));
      }
      let csrftoken = false;
      _.forEach(res.headers['set-cookie'], (cookie) => {
        if (cookie.indexOf('csrftoken') !== -1) {
          csrftoken = cookie.split(';')[0].split('=')[1];
        }
      });
      if (!csrftoken) {
        return callback && callback(new error(error.err.api));
      }
      
      let params = {
        'phone_id': helper.generateUUID(true),
        '_csrftoken': csrftoken,
        'username': username,
        'guid': uuid,
        'device_id': device_id,
        'password': password,
        'login_attempt_count': '0'
      };
      helper.apiCall('/accounts/login/', helper.generateSignature(JSON.stringify(params)), (err, data, res) => {
        if (err) {
          return callback && callback(err);
        }
        if (data.status == 'fail') {
          return callback && callback(new error(error.err.api, data.message));
        }
        data.logged_in_user.username_id = data.logged_in_user.pk;
        data.logged_in_user.uuid = uuid;
        data.logged_in_user.rank_token = data.logged_in_user.pk + '_' + uuid;
        data.logged_in_user.cookies = {};
        _.forEach(res.headers['set-cookie'], (cookie) => {
          let pair = cookie.split(';')[0].split('=');
          data.logged_in_user.cookies[pair[0]] = pair[1];
          if (pair[0].indexOf('csrftoken') !== -1) {
            data.logged_in_user.token = pair[1];
          }
        });
        
        if (this.username && this.password) {
          this.userSignature = data.logged_in_user;
        }
        callback && callback(null, data.logged_in_user);
        
        this.simulateAfterLogin(data.logged_in_user);
      });
    });
  }

  simulateAfterLogin (userSignature, callback) {
    if (typeof userSignature === 'function') {
      callback = userSignature;
      userSignature = null;
    }
    userSignature = this._getUserSignature(userSignature);
    
    async.series([
      (done) => {
        this.syncFeatures(userSignature, done);
      },
      (done) => {
        this.autoCompleteUserList(userSignature, done);
      },
      (done) => {
        this.getTimelineFeed(userSignature, done);
      },
      (done) => {
        this.getv2Inbox(userSignature, done);
      },
      (done) => {
        this.getRecentActivity(userSignature, done);
      }
    ], callback);
  }
  
  simulateAppActivity (userSignature, callback) {
    if (typeof userSignature === 'function') {
      callback = userSignature;
      userSignature = null;
    }
    userSignature = this._getUserSignature(userSignature);

    async.series([
      (done) => {
        this.getv2Inbox(userSignature, done);
      },
      (done) => {
        this.getRecentActivity(userSignature, done);
      }
    ], callback);
  }
  
  uploadPhoto (photoPath, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = _.merge({
      caption: '',
      upload_id: null,
      userSignature: this.userSignature
    }, options);

    let fileToUpload;
    if (!options.upload_id) {
      options.upload_id = helper.getMicroTime();
      fileToUpload = fs.readFileSync(photoPath);
    } else {
      //fileToUpload = fs.createReadStream(photoPath);
    }
    
    let data = {
      upload_id: options.upload_id,
      _uuid: options.userSignature.uuid,
      _csrftoken: options.userSignature.token,
      image_compression: '{"lib_name":"jt","lib_version":"1.3.0","quality":"70"}',
      photo: {
        value:  fs.createReadStream(photoPath),
        options: {
          filename: 'pending_media_' + options.upload_id + '.jpg',
          contentType: 'application/octet-stream',
          contentTransferEncoding: 'binary'
        }
      }
    };
    
    helper.sendFile('/upload/photo/', data, options.userSignature, (err, data) => {
      if (err) {
        return callback && callback(err);
      }
      if (!data || (data.status && data.status == 'fail')) {
        return callback && callback(new error(error.err.api, data.message));
      }
      // Some times instagram don't react fast. Need timeout
      setTimeout(() => {
        this.configurePhoto(data.upload_id, photoPath, options, (err, data) => {
          if (err) {
            return callback && callback(err);
          }
          if (data.status == 'fail') {
            return callback && callback(new error(error.err.api, data.message));
          }
          // Some times instagram don't react fast. Need timeout
          setTimeout(() => {
            this.expose(options.userSignature, () => {
              callback && callback(err, data);
            });
          }, 2000);
        });
      }, 1000);
    });
  }
  
  configurePhoto (upload_id, photoPath, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = _.merge({
      caption: '',
      userSignature: this.userSignature
    }, options);
    
    let size = imageSize(photoPath);
    let data = JSON.stringify({
      upload_id: upload_id,
      camera_model: 'HM1S',
      source_type: 3,
      date_time_original: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/-/g, ':'), // need YYYY:mm:dd HH:ii:ss
      camera_make: 'XIAOMI',
      edits: {
        crop_original_size: [size.width, size.width],
        crop_zoom: 1.3333334,
        crop_center: [0.0, -0.0]
      },
      extra: {
        source_width: size.width,
        source_height: size.width
      },
      device: {
        manufacturer: 'Xiaomi',
        model: 'HM 1SW',
        android_version: 18,
        android_release: '4.3'
      },
      _csrftoken: options.userSignature.token,
      _uuid: options.userSignature.uuid,
      _uid: options.userSignature.username_id,
      caption: options.caption
    }).replace('"crop_center":[0,0]', '"crop_center":[0.0,-0.0]');
    
    helper.apiCall('/media/configure/', helper.generateSignature(data), options.userSignature.cookies, callback);
  }
  
  expose (userSignature, callback) {
    if (typeof userSignature === 'function') {
      callback = userSignature;
      userSignature = null;
    }

    userSignature = this._getUserSignature(userSignature);
    
    let data = JSON.stringify({
      _uuid: userSignature.uuid,
      _uid: userSignature.username_id,
      id: userSignature.username_id,
      _csrftoken: userSignature.token,
      experiment: 'ig_android_profile_contextual_feed'
    });
    
    helper.apiCall('/qe/expose/', helper.generateSignature(data), userSignature.cookies, callback);
  }

  syncFeatures (userSignature, callback) {
    if (typeof userSignature === 'function') {
      callback = userSignature;
      userSignature = null;
    }

    userSignature = this._getUserSignature(userSignature);

    let data = JSON.stringify({
      _uuid: userSignature.uuid,
      _uid: userSignature.username_id,
      id: userSignature.username_id,
      _csrftoken: userSignature.token,
      experiments: experiments
    });

    helper.apiCall('/qe/sync/', helper.generateSignature(data), userSignature.cookies, callback);
  }

  autoCompleteUserList (userSignature, callback) {
    if (typeof userSignature === 'function') {
      callback = userSignature;
      userSignature = null;
    }
    userSignature = this._getUserSignature(userSignature);
    helper.apiCall('/friendships/autocomplete_user_list/', null, userSignature.cookies, callback);
  }

  getTimelineFeed (userSignature, callback) {
    if (typeof userSignature === 'function') {
      callback = userSignature;
      userSignature = null;
    }
    userSignature = this._getUserSignature(userSignature);
    helper.apiCall('/feed/timeline/', null, userSignature.cookies, callback);
  }
  
  getv2Inbox (userSignature, callback) {
    if (typeof userSignature === 'function') {
      callback = userSignature;
      userSignature = null;
    }
    userSignature = this._getUserSignature(userSignature);
    helper.apiCall('/direct_v2/inbox/?', null, userSignature.cookies, callback);
  }

  getRecentActivity (userSignature, callback) {
    if (typeof userSignature === 'function') {
      callback = userSignature;
      userSignature = null;
    }
    userSignature = this._getUserSignature(userSignature);
    helper.apiCall('/news/inbox/?', null, userSignature.cookies, callback);
  }
  
  _getUserSignature (customUserSignature) {
    if (!customUserSignature) {
      return this.userSignature;
    }
    return customUserSignature;
  }
}

module.exports = InstaNode;