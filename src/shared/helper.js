//SATYAJIT
import jwt_decode from "jwt-decode";

export function getMyId() {
  try {
    let token_data = jwt_decode(localStorage.token);
    return token_data.did;
  } catch (error) {
    localStorage.clear();
    window.location.href = "";
  }
}



export function getAdminName(token) {
  try {
    let token_data = jwt_decode(token);
    return token_data.name;
  } catch (error) {
    localStorage.clear();
    window.location.href = "";
  }
}


export function getSuperAdmin(token) {
  try {
    let token_data = jwt_decode(token);
    // console.log(token_data.admin)
    return token_data.admin;
  } catch (error) {
    localStorage.clear();
    window.location.href = "";
  }
}



export function getUserDisplayName() {
  try {
    let token_data = jwt_decode(localStorage.token);
    return {
      name: token_data.name,
      designation: token_data.desig_name,
    };
  } catch (error) {
    localStorage.clear();
    window.location.href = "/";
  }
}

export function htmlDecode(string) {
  const Entities = require("html-entities").AllHtmlEntities;
  const entities = new Entities();
  return entities.decode(string);
}

export const stringToSlug = (str, seperator = "-") => {
	if (str) {
		str = str.replace(/[`~!@#$%^&*()_\-+=\[\]{};:'"\\|\/,.<>?\s]/g, ' ').toLowerCase(); // replace with space
		str = str.replace(/^\s+|\s+$/gm, ''); //remove whitespace
		str = str.replace(/\s+/g, seperator);	// replace with seperator
		return str;
	}
	return '-';
}

export function localDate(cell) {
  var date_time = cell.split(" ");
  var date = date_time[0].split("-");
  var date_format = new Date(date[0], date[1] - 1, date[2]);
  return date_format;
}

export function localDateTime(cell) {
  if (cell) {
    var date_time = cell.split(" ");
    var date = date_time[0].split("-");
    var time = date_time[1].split(":");
    var date_format = new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
    return date_format;
  }
}

export function localDateOnly(cell) {
  var date = cell.split("-");
  var date_format = new Date(date[0], date[1] - 1, date[2]);
  return date_format;
}

export function trimString(length, string) {
  var trimmedString = string.substring(0, length);
  return `${trimmedString}...`;
}


export function inArray(needle, haystack) {
  var length = haystack.length;
  for (var i = 0; i < length; i++) {
    if (haystack[i] == needle) return true;
  }
  return false;
}

export const setFieldName = (fieldName, sperator = "_") => {
	if (fieldName) {
		return fieldName.split(sperator).map((word) => {
			return `${word.charAt(0).toUpperCase()}${word.substr(1).toLowerCase()} `;
		}).join("").trim();
	}
	return fieldName;
};

export function getUserEmail() {
  try {
    let token_data = jwt_decode(localStorage.token);
    return {
      email: token_data.email,
    };
  } catch (error) {
    // localStorage.clear();
    // window.location.href="/";
  }
}
export const getHeightWidth = (file) => {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    var height;
    var width;
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      var image = new Image();
      image.src = e.target.result;
      image.onload = function () {
        height = this.height;
        width = this.width;

        resolve({
          height: height,
          width: width
        })
      };
    };
  })
}

export const getHeightWidthFromURL = (url) => {
  console.log(url);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = function () {
      const height = this.height;
      const width = this.width;
      console.log(height, width);
      resolve({
        height: this.height,
        width: this.width
      })
    };
  })
}

const resolution_arr = [
  {
    tag: `home-banner-images`,
    width: `1920`,
    height: `698`
  },
  {
    tag: `landening-banner-images`,
    width: `1920`,
    height: `620`
  },
  {
    tag: `others-banner-images`,
    width: `1920`,
    height: `350`
  },
  {
    tag: `testimonial-images`,
    width: `257`,
    height: `188`
  },
  {
    tag: `event-images`,
    width: `250`,
    height: `1000`,
  },
  {
    tag: `offer-images`,
    width: `449`,
    height: `180`,
  },
  {
    tag: `blog`,
    // width: `505`,
    // height: `342`,
    width: `700`,
    height: `700`,
  },
  {
    tag: `know-who-are`,
    width: `75`,
    height: `75`,
  },
  {
    tag: `thambnail`,
    width: `640`,
    height: `210`,
  },
  {
    tag: `speciality`,
    width: `75`,
    height: `75`,
  },
  {
    tag: `members`,
    width: `275`,
    height: `275`,
  },
  {
    tag: `code_of_conduct`,
    width: `75`,
    height: `75`,
  }, 
  {
    tag: `event`,
    width: `329`,
    height: `166`,
  },
  {
    tag: `application-logo`,
    width: `300`,
    height: `240`,
  },
  {
    tag: `application-banner`,
    width: `54`,
    height: `99`,
  },
  {
    tag: `auto-popup`,
    min_width: `500`,
    min_height: `300`,
    max_width: `1100`,
    max_height: `700`,
  },
  {
    tag: `product-details`,
    width: `438`,
    height: `267`,
  },

  {
    tag: `health-and-benefits`,
    width: `360`,
    height: `183`,
  },
  {
    tag: `partner-current-offers`,
    width: `360`,
    height: `183`,
  },
  {
    tag: `partner-center-images`,
    width: `360`,
    height: `183`,
  },
  {
    tag: `partner-services`,
    width: `360`,
    height: `183`,
  },
  {
    tag: `partner-amenities`,
    width: `360`,
    height: `183`,
  }

]

export const generateResolutionText = (tag) => {
  for (let i in resolution_arr) {
    if (resolution_arr[i].tag === tag) {
      return `(The image resolution should be of width '${resolution_arr[i].width}px' and height '${resolution_arr[i].height}px')`
    }
  }
}

export const getResolution = (tag) => {
  for (let i in resolution_arr) {
    if (resolution_arr[i].tag === tag) {
      return resolution_arr[i]
    }
  }
}
export const FILE_SIZE = 2097152;
export const MB = 2;
export const FILE_VALIDATION_MASSAGE = `(Image type should be .png,.jpeg,.jpg and maximum file size is ${MB} mb.)`
export const FILE_VALIDATION_MASSAGE_SVG = `(Image type should be .png,.jpeg,.jpg,.svg and maximum file size is ${MB} mb.)`
export const FILE_VALIDATION_TYPE_ERROR_MASSAGE = `The file does not match height and width validations.`
export const FILE_VALIDATION_SIZE_ERROR_MASSAGE = `The file exceeds maximum size.`
export const DEFAULT_CITY = 'Mumbai';