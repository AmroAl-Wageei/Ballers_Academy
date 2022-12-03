=== Google Listings & Ads ===
Contributors: automattic, google, woocommerce
Tags: woocommerce, google, listings, ads
Requires at least: 5.8
Tested up to: 6.1
Requires PHP: 7.4
Stable tag: 2.3.1
License: GPLv3
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Native integration with Google that allows merchants to easily display their products across Google’s network.

== Description ==

https://www.youtube.com/watch?v=lYCx7ZqA1uo

Google Listings & Ads makes it simple to showcase your products to shoppers across Google. Whether you’re brand new to digital advertising or a marketing expert, you can expand your reach and grow your business, for free and with ads.

Sync your store with Google to list products for free, run paid ads, and track performance straight from your store dashboard.

With Google Listings & Ads:
- **Connect your store seamlessly** with Google Merchant Center.
- **Reach online shoppers** with free listings.
- **Boost store traffic and sales** with Performance Max Campaigns.

= Connect your store seamlessly =

Integrate with Google Merchant Center to upload relevant store and product data to Google. Your products will sync automatically to make the information available for free listings, Google Ads, and other Google services.

Create a new Merchant Center account or link an existing one to connect your store and list products across Google for free and  with ads.

= Reach online shoppers with free listings =

Showcase eligible products to shoppers looking for what you offer and drive traffic to your store with Google’s free listings on the Shopping tab.

Your products can also appear on Google Search, Google Images, and Gmail if you’re selling in the United States.

*Learn more about supported countries for Google free listings [here](https://support.google.com/merchants/answer/10033607?hl=en).*

= Boost store traffic and sales with Google Ads =

Grow your business with Performance Max campaigns. Create an ad campaign to promote your products across Google Search, Shopping, YouTube, Gmail, and the Display Network.

Connect your Google Ads account, choose a budget, and launch your campaign straight from your WooCommerce dashboard. You can also review campaign analytics and access automated reports to easily see how your ads are performing.

*Learn more about supported countries and currencies for Performance Max campaigns [here](https://support.google.com/merchants/answer/160637#countrytable).*

= Get $500 in Google Ads credit when you spend your first $500! =

Create a new Google Ads account through Google Listings & Ads and a promotional code will be automatically applied to your account. You’ll have 60 days to spend $500 to qualify for the $500 ads credit. See full terms and conditions [here](https://www.google.com/ads/coupons/terms/).

== Installation ==

= Minimum Requirements =

* WordPress 5.7 or greater
* WooCommerce 6.9 or greater
* PHP version 7.4 or greater
* MySQL version 5.6 or greater

Visit the [WooCommerce server requirements documentation](https://docs.woocommerce.com/document/server-requirements/) for a detailed list of server requirements.

= Automatic installation =

Automatic installation is the easiest option as WordPress handles the file transfers itself and you don’t need to leave your web browser. To do an automatic install of this plugin, log in to your WordPress dashboard, navigate to the Plugins menu and click Add New.

In the search field type “Google Listings and Ads” and click Search Plugins. Once you’ve found this plugin you can view details about it such as the point release, rating and description. Most importantly of course, you can install it by simply clicking “Install Now”.

= Manual installation =

The manual installation method involves downloading the plugin and uploading it to your webserver via your favourite FTP application. The WordPress codex contains [instructions on how to do this here](https://codex.wordpress.org/Managing_Plugins#Manual_Plugin_Installation).

= Where can I report bugs or contribute to the project? =

Bugs should be reported in the [Google Listings and Ads GitHub repository](https://github.com/woocommerce/google-listings-and-ads/).

= This is awesome! Can I contribute? =

Yes you can! Join in on our [GitHub repository](https://github.com/woocommerce/google-listings-and-ads/) :)

Release and roadmap notes available on the [WooCommerce Developers Blog](https://woocommerce.wordpress.com/)

== FAQ ==

= What is Google Merchant Center? =
The Google Merchant Center helps you sync your store and product data with Google and makes the information available for both free listings on the Shopping tab and Google Shopping Ads. That means everything about your stores and products is available to shoppers when they search on a Google property.

= Which countries are available for Google Listings & Ads? =
Learn more about supported countries for Google free listings [here](https://support.google.com/merchants/answer/10033607?hl=en).

Learn more about supported countries and currencies for Performance Max campaigns [here](https://support.google.com/merchants/answer/160637#countrytable).

= Where will my products appear? =
If you’re selling in the US, then eligible free listings can appear in search results across Google Search, Google Images, and the Google Shopping tab. If you're selling outside the US, free listings will appear on the Shopping tab.

If you’re running a Performance Max campaign, your approved products can appear on Google Search, the Shopping tab, Gmail, Youtube and the Google Display Network.

= Will my deals and promotions display on Google? =
To show your coupons and promotions on Google Shopping listings, make sure you’re using the latest version of Google Listings & Ads.  When you create or update a coupon in your WordPress dashboard under Marketing > Coupons, you’ll see a Channel Visibility settings box on the right: select “Show coupon on Google” to enable. This is currently available in the US only.

= What are Performance Max campaigns? =
Performance Max campaigns are Google Ads that combine Google’s machine learning with automated bidding and ad placements to maximize conversion value and strategically display your ads to people searching for products like yours, at your given budget. The best part? You only pay when people click on your ad.

= How much do Performance Max campaigns cost? =
Performance Max campaigns are pay-per-click, meaning you only pay when someone clicks on your ads. You can customize your daily budget in Google Listings & Ads but we recommend starting off with the suggested minimum budget, and you can change this budget at any time.

= Can I run both free listings and Performance Max campaigns at the same time? =
Yes, you can run both at the same time, and we recommend it! In the US, advertisers running free listings and ads together have seen an average of over 50% increase in clicks and over 100% increase in impressions on both free listings and ads on the Shopping tab. Your store is automatically opted into free listings automatically and can choose to run a paid Performance Max campaign.

== Changelog ==

= 2.3.1 - 2022-11-22 =
* Add -  Attribute Mapping Feature.
* Dev - Add script to list DEWPed dependencies' versions for a given WC version.
* Fix - Incorrect product statistics count.
* Fix - Yoast global identifiers for variable products.
* Tweak - Remove unused GRPC packages.
* Tweak - WC 7.1 compatibility.
* Update - Change multipack attribute input to be native number input, to improve accessibility.
* Update - Drop support for WC < 6.9.

= 2.2.1 - 2022-11-15 =
* Add - Declare compatibility for High Performance Order Storage.
* Dev - Selectively externalize bundled packages.
* Fix - E2E Testing: Reduce the false positive rate and adjust the running events on GitHub Actions.
* Fix - Move the order of Google Listings & Ads below the Coupons in the Marketing menu of WooCommerce admin page.
* Fix - WC 6.9 compatibility: Shipping time settings should not appear after selecting the "complex" shipping option.
* Fix - WC 6.9 compatibility: The free shipping threshold should be cleared after selecting the "No" free shipping option.
* Fix - WC 6.9 compatibility: The selected free shipping option should be reset after setting all shipping rates to 0.
* Fix - WC 7.1 compatibility: Fixing the forms in the free listings setup may cause infinite requesting state updates which lead to a blank page or issue a lot of API requests.
* Fix - WordPress 5.9 Compatibility: Visually hide descriptions of external link icons.
* Fix - WordPress 6.1 Compatibility: Popover and Tooltip components should be displayed as floating.
* Fix - WordPress 6.1 Compatibility: The size of navigation icons in Datepicker component should not be a giant size.
* Tweak - WC 7.1 compatibility.
* Tweak - WP 6.1 compatibility.
* Update - ISO3166 package version 4.1.

= 2.2.0 - 2022-10-18 =
* Add - Ad previews in the post-onboarding ads setup flow.
* Add - Combine the audience and shipping steps for the onboarding flow and the editing free listings page.
* Add - Streamlined Free Listings + Paid Ads for the onboarding flow.
* Add - The disclaimer of Comparison Shopping Service of the accounts setup of onboarding flow.
* Add - The submission success modal on the Product Feed page after the onboarding is completed along with paid ads setup.
* Fix - A validateDOMNesting warning in the accounts setup step of the onboarding flow.
* Fix - Free Listings + Paid Ads: Add the paid ads previews to the boost product listings section.
* Fix - Remove - Support for WC < 6.8.
* Fix - Shipping time values flash during the onboarding setup.
* Fix - Steppers on the onboarding flow allow switching to later steps when the current step is not yet finished.
* Fix - The "Or, create a new Google Ads account" button at the footer of the Google Ads account setup is clickable when connecting an existing account.
* Fix - The incorrect active status style for a disabled button.
* Tweak - Use different titles for the free listings setup of the onboarding and editing pages.
* Update - Change the steppers in the onboarding flow to only allow going back to the previous steps.
* Update - Detect the verification status of the phone number in the contact information settings.
* Update - Layouts and copywriting of the Get Started page and the onboarding flow.
* Update - Logos of Google Merchant Center and Google Ads.
* Update - Open the billing setup page of Google Ads via a popup window and add an alternative hyperlink to open the same setup page.
* Update - The FAQs in the paid ads setup and the campaign setup page.

[See changelog for all versions](https://raw.githubusercontent.com/woocommerce/google-listings-and-ads/trunk/changelog.txt).
