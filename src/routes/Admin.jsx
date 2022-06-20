import React, { Component } from "react";

import { Route, Switch, Redirect } from "react-router-dom";

import Login from "../components/admin/login/Login";
import AdminPageNotFound from "../components/404/AdminPageNotFound";
import Testimonials from "../components/admin/testimonials/Testimonials";
import AutoPopup from "../components/admin/auto-popup/AutoPopup";
import Dashboard from "../components/admin/dashboard/Dashboard";
import AdminProfile from "../components/admin/profile/Profile";
import Patients from "../components/admin/patients/Patients";
import Banner from "../components/admin/banner/Banner";
import Categories from "../components/admin/categories/Categories";
import Blogs from "../components/admin/blogs/Blogs";
import AddBlog from "../components/admin/blogs/AddBlog";
import EditBlog from "../components/admin/blogs/EditBlog";
import Events from "../components/admin/events/Events";
import AddEvent from "../components/admin/events/AddEvent";
import EditEvent from "../components/admin/events/EditEvent";
import Offers from "../components/admin/offers/Offers";
import AddOffer from "../components/admin/offers/AddOffer";
import EditOffer from "../components/admin/offers/EditOffer";
import SocialLink from "../components/admin/sociallink/SocialLink";
import Message from "../components/admin/message/Message";
import Gallery from "../components/admin/gallery/Gallery";
import SplashScreen from "../components/admin/app/SplashScreen";
import HelpTour from "../components/admin/app/HelpTour";
import ApplicationBanner from "../components/admin/app/ApplicationBanner";

import PrivacyPolicy from "../components/admin/pages/privacy-policy/PrivacyPolicy";
import Disclaimer from "../components/admin/pages/disclaimer/Disclaimer";
import TermsConditions from "../components/admin/pages/terms-conditions/TermsConditions";
import EditPrivacyPolicy from "../components/admin/pages/privacy-policy/EditPrivacyPolicy";
import EditDisclaimer from "../components/admin/pages/disclaimer/EditDisclaimer";
import AboutSRL from "../components/admin/pages/aboutsrl/AboutSRL";
import EditAboutSRL from "../components/admin/pages/aboutsrl/EditAboutSRL";
import WhyUs from "../components/admin/pages/whyus/WhyUs";
import EditWhyUs from "../components/admin/pages/whyus/EditWhyUs";
import Values from "../components/admin/pages/values/Values";
import EditValues from "../components/admin/pages/values/EditValues";
import KeyMembers from "../components/admin/pages/keymembers/KeyMembers";
import EditKeyMembers from "../components/admin/pages/keymembers/EditKeyMembers";
import Awards from "../components/admin/pages/awards&accreditations/Awards";
import EditAwards from "../components/admin/pages/awards&accreditations/EditAwards";
import EditTermsConditions from "../components/admin/pages/terms-conditions/EditTermsConditions";
import CovidAntibody from "../components/admin/pages/covidantibody/CovidAntibody";
import EditCovidAntibody from "../components/admin/pages/covidantibody/EditCovidAntibody";
import Numbers from "../components/admin/numbers/Numbers";
import OfficeAddresses from "../components/admin/office-addresses/OfficeAddresses";
import LeadForms from "../components/admin/lead-forms/LeadForms";
import KnowWho from "../components/admin/home/KnowWho";
import SampleJourneny from "../components/admin/home/SampleJourney";
import FAQ from "../components/admin/covid19/FAQ";
import Speciality from "../components/admin/covid19/Speciality";
import EBookUpload from "../components/admin/covid19/EBookUpload";
import TestCenters from "../components/admin/covid19/TestCenters";
import Members from "../components/admin/investors/Members";
import CodeOfConduct from "../components/admin/investors/CodeOfConduct";
import Documents from "../components/admin/investors/Documents";
import BannerOrdering from "../components/admin/ordering/BannerOrdering";
import SpecialityOrdering from "../components/admin/ordering/SpecialityOrdering";
import CodeofConductOrdering from "../components/admin/ordering/CodeofConductOrdering";
import FaqOrdering from "../components/admin/ordering/FaqOrdering";
import MembersType from "../components/admin/memberstype/MermbersType";

import ProductDetails from "../components/admin/lead-landing-page/ProductDetails";
import HealthandBenefits from "../components/admin/lead-landing-page/HealthwithBenefits";
import Accordian from "../components/admin/product-details/Accordion";
import AddAccordian from "../components/admin/product-details/AddAccordion";
import EditAccordion from "../components/admin/product-details/EditAccordion";
import CurrentOffersPartnerPage from "../components/admin/partner-page/CurrentOffersPartnerPage";
import AboutUsPartnerPage from '../components/admin/partner-page/AboutUsPartnerPage';
import CenterImagePartnerPage from '../components/admin/partner-page/CenterImagePartnerPage';
import AmenitiesPartnerPage from '../components/admin/partner-page/AmenitiesPartnerPage';
import ServicesPartnerPage from '../components/admin/partner-page/ServicesPartnerPage';
import "../assets/css/all.css";
import "../assets/css/admin-style.css";
import "../assets/css/admin-skin-blue.css";
import "react-bootstrap-table/dist/react-bootstrap-table.min.css";


// Private Route for inner component
const PrivateRoute = ({ component: RefComponent, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      localStorage.getItem("admin_token") ? (
        <RefComponent {...props} />
      ) : (
        <Redirect to="/" />
      )
    }
  />
);

class Admin extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={Login} />
        <PrivateRoute
          path="/dashboard"
          component={Dashboard}
          handler="Dashboard"
        />

        <PrivateRoute path="/banner" component={Banner} handler="Banner" />
        <PrivateRoute path="/testimonials" component={Testimonials} />
        <PrivateRoute path="/auto-popup" component={AutoPopup} />
        <PrivateRoute path="/categories" component={Categories} />
        <PrivateRoute path="/blogs" component={Blogs} />
        <PrivateRoute path="/add-blog" component={AddBlog} />
        <PrivateRoute path="/edit-blog/:id" component={EditBlog} />
        <PrivateRoute path="/events" component={Events} />
        <PrivateRoute path="/add-event" component={AddEvent} />
        <PrivateRoute path="/edit-event/:id" component={EditEvent} />
        <PrivateRoute path="/offers" component={Offers} />
        <PrivateRoute path="/add-offer" component={AddOffer} />
        <PrivateRoute path="/edit-offer/:id" component={EditOffer} />
        <PrivateRoute path="/sociallink" component={SocialLink} />
        <PrivateRoute path="/message" component={Message} />


        <PrivateRoute
          path="/lead_landing_page/product"
          component={ProductDetails}
        />

        <PrivateRoute
          path="/lead_landing_page/health&benefits"
          component={HealthandBenefits}
        />

        <PrivateRoute path="/product-details/accordion" component={Accordian} />
        <PrivateRoute
          path="/product-details/add-accordion"
          component={AddAccordian}
        />

        <PrivateRoute
          path="/product-details/edit-accordion/:id"
          component={EditAccordion}
        />

        <PrivateRoute
          path="/partner-page/aboutus"
          component={AboutUsPartnerPage}
        />
        <PrivateRoute
          path="/partner-page/services"
          component={ServicesPartnerPage}
        />
        <PrivateRoute
          path="/partner-page/amenities"
          component={AmenitiesPartnerPage}
        />
        <PrivateRoute
          path="/partner-page/current-offers"
          component={CurrentOffersPartnerPage}
        />
        <PrivateRoute
          path="/partner-page/center-images"
          component={CenterImagePartnerPage}
        />


        <PrivateRoute path="/pages/privacy-policy" component={PrivacyPolicy} />
        <PrivateRoute path="/pages/disclaimer" component={Disclaimer} />
        <PrivateRoute
          path="/pages/terms-and-conditions"
          component={TermsConditions}
        />
        <PrivateRoute
          path="/pages/edit-privacy-policy/:id"
          component={EditPrivacyPolicy}
        />
        <PrivateRoute
          path="/pages/edit-disclaimer/:id"
          component={EditDisclaimer}
        />
        <PrivateRoute
          path="/pages/edit-terms-and-conditions/:id"
          component={EditTermsConditions}
        />
        <PrivateRoute path="/pages/covidantibody" component={CovidAntibody} />
        <PrivateRoute
          path="/pages/edit-covidantibody/:id"
          component={EditCovidAntibody}
        />
        <PrivateRoute path="/about-us/about-srl" component={AboutSRL} />
        <PrivateRoute
          path="/about-us/edit-about-srl/:id"
          component={EditAboutSRL}
        />
        <PrivateRoute path="/about-us/why-us" component={WhyUs} />
        <PrivateRoute path="/about-us/edit-why-us/:id" component={EditWhyUs} />

        <PrivateRoute path="/about-us/values" component={Values} />
        <PrivateRoute path="/about-us/edit-values/:id" component={EditValues} />
        <PrivateRoute path="/about-us/key-members" component={KeyMembers} />
        <PrivateRoute
          path="/about-us/edit-key-members/:id"
          component={EditKeyMembers}
        />
        <PrivateRoute
          path="/about-us/awards-accreditation"
          component={Awards}
        />
        <PrivateRoute
          path="/about-us/edit-awards-accreditation/:id"
          component={EditAwards}
        />
        <PrivateRoute path="/contact-us/numbers" component={Numbers} />
        <PrivateRoute
          path="/contact-us/office-addresses"
          component={OfficeAddresses}
        />
        <PrivateRoute path="/lead-forms" component={LeadForms} />
        <PrivateRoute path="/home/know-who-we-are" component={KnowWho} />
        <PrivateRoute path="/home/sample-journey" component={SampleJourneny} />
        <PrivateRoute path="/covid19/faq" component={FAQ} />
        <PrivateRoute path="/covid19/speciality" component={Speciality} />
        <PrivateRoute path="/covid19/ebook-upload" component={EBookUpload} />
        <PrivateRoute path="/covid19/testing-center" component={TestCenters} />
        <PrivateRoute path="/investors/members" component={Members} />
        <PrivateRoute
          path="/investors/code-of-conduct"
          component={CodeOfConduct}
        />
        <PrivateRoute path="/investors/documents" component={Documents} />
        <PrivateRoute path="/gallery" component={Gallery} />
        <PrivateRoute path="/app/splash-schreen" component={SplashScreen} />
        <PrivateRoute path="/app/helptour" component={HelpTour} />
        <PrivateRoute
          path="/app/application-banner"
          component={ApplicationBanner}
        />
        <PrivateRoute path="/ordering/banner" component={BannerOrdering} />
        <PrivateRoute
          path="/ordering/speciality"
          component={SpecialityOrdering}
        />
        <PrivateRoute
          path="/ordering/code-of-conduct"
          component={CodeofConductOrdering}
        />
        <PrivateRoute path="/ordering/faq" component={FaqOrdering} />
        <PrivateRoute path="/investors/memberstype" component={MembersType} />
        <Route from="*" component={AdminPageNotFound} />
      </Switch>
    );
  }
}

export default Admin;
