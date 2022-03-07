import React, { Component } from 'react';

import { Route, Switch, Redirect } from 'react-router-dom';

import Login from '../components/admin/login/Login';
import AdminPageNotFound from '../components/404/AdminPageNotFound';
import Testimonials from '../components/admin/testimonials/Testimonials';
import AutoPopup from '../components/admin/auto-popup/AutoPopup';
import Dashboard from '../components/admin/dashboard/Dashboard';
import AdminProfile from '../components/admin/profile/Profile';
import Patients from '../components/admin/patients/Patients';
import Banner from '../components/admin/banner/Banner';
import Categories from '../components/admin/categories/Categories';
import Blogs from '../components/admin/blogs/Blogs';
import AddBlog from '../components/admin/blogs/AddBlog';
import EditBlog from '../components/admin/blogs/EditBlog';
import Events from '../components/admin/events/Events';
import AddEvent from '../components/admin/events/AddEvent';
import EditEvent from '../components/admin/events/EditEvent';
import Offers from '../components/admin/offers/Offers';
import AddOffer from '../components/admin/offers/AddOffer';
import EditOffer from '../components/admin/offers/EditOffer';
import SocialLink from '../components/admin/sociallink/SocialLink';
import Message from '../components/admin/message/Message';
import Gallery from '../components/admin/gallery/Gallery';
import SplashScreen from '../components/admin/app/SplashScreen';
import HelpTour from '../components/admin/app/HelpTour';
import ApplicationBanner from '../components/admin/app/ApplicationBanner';

import PrivacyPolicy from '../components/admin/pages/privacy-policy/PrivacyPolicy';
import Disclaimer from '../components/admin/pages/disclaimer/Disclaimer';
import TermsConditions from '../components/admin/pages/terms-conditions/TermsConditions';
import EditPrivacyPolicy from '../components/admin/pages/privacy-policy/EditPrivacyPolicy';
import EditDisclaimer from '../components/admin/pages/disclaimer/EditDisclaimer';
import AboutSRL from '../components/admin/pages/aboutsrl/AboutSRL';
import EditAboutSRL from '../components/admin/pages/aboutsrl/EditAboutSRL';
import WhyUs from '../components/admin/pages/whyus/WhyUs';
import EditWhyUs from '../components/admin/pages/whyus/EditWhyUs';
import Values from '../components/admin/pages/values/Values';
import EditValues from '../components/admin/pages/values/EditValues';
import KeyMembers from '../components/admin/pages/keymembers/KeyMembers';
import EditKeyMembers from '../components/admin/pages/keymembers/EditKeyMembers';
import Awards from '../components/admin/pages/awards&accreditations/Awards';
import EditAwards from '../components/admin/pages/awards&accreditations/EditAwards';
import EditTermsConditions from '../components/admin/pages/terms-conditions/EditTermsConditions';
import CovidAntibody from '../components/admin/pages/covidantibody/CovidAntibody';
import EditCovidAntibody from '../components/admin/pages/covidantibody/EditCovidAntibody';
import Numbers from '../components/admin/numbers/Numbers';
import OfficeAddresses from '../components/admin/office-addresses/OfficeAddresses';
import LeadForms from '../components/admin/lead-forms/LeadForms';
import KnowWho from '../components/admin/home/KnowWho';
import SampleJourneny from '../components/admin/home/SampleJourney';
import FAQ from '../components/admin/covid19/FAQ';
import Speciality from '../components/admin/covid19/Speciality';
import EBookUpload from '../components/admin/covid19/EBookUpload';
import TestCenters from '../components/admin/covid19/TestCenters';
import Members from '../components/admin/investors/Members';
import CodeOfConduct from '../components/admin/investors/CodeOfConduct';
import Documents from '../components/admin/investors/Documents';
import BannerOrdering from '../components/admin/ordering/BannerOrdering';
import SpecialityOrdering from '../components/admin/ordering/SpecialityOrdering';
import CodeofConductOrdering from '../components/admin/ordering/CodeofConductOrdering';
import FaqOrdering from '../components/admin/ordering/FaqOrdering';
import MembersType from '../components/admin/memberstype/MermbersType';

import ProductDetails from '../components/admin/lead-landing-page/ProductDetails';
import HealthandBenefits from '../components/admin/lead-landing-page/HealthwithBenefits';
import Accordian from '../components/admin/product-details/Accordion';
import AddAccordian from '../components/admin/product-details/AddAccordion';
import EditAccordion from '../components/admin/product-details/EditAccordion';
import '../assets/css/all.css';
import '../assets/css/admin-style.css';
import '../assets/css/admin-skin-blue.css';
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css';

// Private Route for inner component
const PrivateRoute = ({ component: RefComponent, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      localStorage.getItem('admin_token') ? (
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
          exact
          path="/admin/dashboard"
          component={Dashboard}
          handler="Dashboard"
        />

        <PrivateRoute
          path="/admin/banner"
          component={Banner}
          handler="Banner"
        />
        <PrivateRoute path="/admin/testimonials" component={Testimonials} />
        <PrivateRoute path="/admin/auto-popup" component={AutoPopup} />
        <PrivateRoute path="/admin/categories" component={Categories} />
        <PrivateRoute path="/admin/blogs" component={Blogs} />
        <PrivateRoute path="/admin/add-blog" component={AddBlog} />
        <PrivateRoute path="/admin/edit-blog/:id" component={EditBlog} />
        <PrivateRoute path="/admin/events" component={Events} />
        <PrivateRoute path="/admin/add-event" component={AddEvent} />
        <PrivateRoute path="/admin/edit-event/:id" component={EditEvent} />
        <PrivateRoute path="/admin/offers" component={Offers} />
        <PrivateRoute path="/admin/add-offer" component={AddOffer} />
        <PrivateRoute path="/admin/edit-offer/:id" component={EditOffer} />
        <PrivateRoute path="/admin/sociallink" component={SocialLink} />
        <PrivateRoute path="/admin/message" component={Message} />

        <PrivateRoute
          path="/admin/lead_landing_page/product"
          component={ProductDetails}
        />

        <PrivateRoute
          path="/admin/lead_landing_page/health&benefits"
          component={HealthandBenefits}
        />

        <PrivateRoute
          path="/admin/product-details/accordion"
          component={Accordian}
        />
        <PrivateRoute
          path="/admin/product-details/add-accordion"
          component={AddAccordian}
        />

        <PrivateRoute
          path="/admin/product-details/edit-accordion/:id"
          component={EditAccordion}
        />

        <PrivateRoute
          path="/admin/pages/privacy-policy"
          component={PrivacyPolicy}
        />
        <PrivateRoute path="/admin/pages/disclaimer" component={Disclaimer} />
        <PrivateRoute
          path="/admin/pages/terms-and-conditions"
          component={TermsConditions}
        />
        <PrivateRoute
          path="/admin/pages/edit-privacy-policy/:id"
          component={EditPrivacyPolicy}
        />
        <PrivateRoute
          path="/admin/pages/edit-disclaimer/:id"
          component={EditDisclaimer}
        />
        <PrivateRoute
          path="/admin/pages/edit-terms-and-conditions/:id"
          component={EditTermsConditions}
        />
        <PrivateRoute
          path="/admin/pages/covidantibody"
          component={CovidAntibody}
        />
        <PrivateRoute
          path="/admin/pages/edit-covidantibody/:id"
          component={EditCovidAntibody}
        />
        <PrivateRoute path="/admin/about-us/about-srl" component={AboutSRL} />
        <PrivateRoute
          path="/admin/about-us/edit-about-srl/:id"
          component={EditAboutSRL}
        />
        <PrivateRoute path="/admin/about-us/why-us" component={WhyUs} />
        <PrivateRoute
          path="/admin/about-us/edit-why-us/:id"
          component={EditWhyUs}
        />

        <PrivateRoute path="/admin/about-us/values" component={Values} />
        <PrivateRoute
          path="/admin/about-us/edit-values/:id"
          component={EditValues}
        />
        <PrivateRoute
          path="/admin/about-us/key-members"
          component={KeyMembers}
        />
        <PrivateRoute
          path="/admin/about-us/edit-key-members/:id"
          component={EditKeyMembers}
        />
        <PrivateRoute
          path="/admin/about-us/awards-accreditation"
          component={Awards}
        />
        <PrivateRoute
          path="/admin/about-us/edit-awards-accreditation/:id"
          component={EditAwards}
        />
        <PrivateRoute path="/admin/contact-us/numbers" component={Numbers} />
        <PrivateRoute
          path="/admin/contact-us/office-addresses"
          component={OfficeAddresses}
        />
        <PrivateRoute path="/admin/lead-forms" component={LeadForms} />
        <PrivateRoute path="/admin/home/know-who-we-are" component={KnowWho} />
        <PrivateRoute
          path="/admin/home/sample-journey"
          component={SampleJourneny}
        />
        <PrivateRoute path="/admin/covid19/faq" component={FAQ} />
        <PrivateRoute path="/admin/covid19/speciality" component={Speciality} />
        <PrivateRoute
          path="/admin/covid19/ebook-upload"
          component={EBookUpload}
        />
        <PrivateRoute
          path="/admin/covid19/testing-center"
          component={TestCenters}
        />
        <PrivateRoute path="/admin/investors/members" component={Members} />
        <PrivateRoute
          path="/admin/investors/code-of-conduct"
          component={CodeOfConduct}
        />
        <PrivateRoute path="/admin/investors/documents" component={Documents} />
        <PrivateRoute path="/admin/gallery" component={Gallery} />
        <PrivateRoute
          path="/admin/app/splash-schreen"
          component={SplashScreen}
        />
        <PrivateRoute path="/admin/app/helptour" component={HelpTour} />
        <PrivateRoute
          path="/admin/app/application-banner"
          component={ApplicationBanner}
        />
        <PrivateRoute
          path="/admin/ordering/banner"
          component={BannerOrdering}
        />
        <PrivateRoute
          path="/admin/ordering/speciality"
          component={SpecialityOrdering}
        />
        <PrivateRoute
          path="/admin/ordering/code-of-conduct"
          component={CodeofConductOrdering}
        />
        <PrivateRoute path="/admin/ordering/faq" component={FaqOrdering} />
        <PrivateRoute
          path="/admin/investors/memberstype"
          component={MembersType}
        />
        <Route from="*" component={AdminPageNotFound} />
      </Switch>
    );
  }
}

export default Admin;
