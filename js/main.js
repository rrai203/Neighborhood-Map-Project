//Model Data
//Create array of locations
var locations = [{
    name: 'Thane',
    lat: 19.2183,
    long: 72.9781,
    marker: '',
}, {
    name: 'Mulund',
    lat: 19.1726,
    long: 72.9425,
    marker: ''
}, {
    name: 'Powai',
    lat: 19.1197,
    long: 72.9051,
    marker: ''
}, {
    name: 'Goregaon',
    lat: 19.1551,
    long: 72.8679,
    marker: ''
}, {
    name: 'Bandra',
    lat: 19.0607,
    long: 72.8362,
    marker: ''
}];


var detail = function(data) {
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.long = ko.observable(data.long);
    this.marker = '';
};

//View Model
function initMap() {
    var viewModel = function() {

        var self = this;

        var mapOptions = {
            zoom: 11,
            center: {
                lat: 19.0760,
                lng: 72.8777
            }
        };

        map = new google.maps.Map(document.getElementById("map"),
            mapOptions);
       

        //Create observable array of markers
        self.markerArray = ko.observableArray(locations);

        var openedInfoWindow = null;

        //Create markers for each location
        self.markerArray().forEach(function(placeItem) {
            contentString = ' ';
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(placeItem.lat, placeItem.long),
                map: map,
                title: placeItem.name,
                animation: google.maps.Animation.DROP
            });
            placeItem.marker = marker;

            //adds animation
            placeItem.marker.addListener('click', toggleBounce);
            
            function toggleBounce() {
                if (placeItem.marker.getAnimation() !== null) {
                    placeItem.marker.setAnimation(null);
                } else {
                    placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function() {
                        placeItem.marker.setAnimation(null);
                    }, 2100);
                }
            }

            //Create variables for use in contentString
            var windowNames = placeItem.name;


            //Create new infowindow
            var infoWindow = new google.maps.InfoWindow({
                content: contentString
            });

            google.maps.event.addListener(placeItem.marker, 'click', function() {
                //Use encodeURI method to replace symbols and spaces with UTF-8 encoding of character
                var formatName = encodeURI(placeItem.name);

                //FourSquare API request URL
                var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + placeItem.lat + ',' + placeItem.long + '&client_id=FVRS5ANVLZT45L1C43VBXUVKNVRQBMUZ3W2HIOEG2KYCRL23&client_secret=54SO4U0OUT2XSKQRSFD5GXE0AB4ZVHMBATLBVT5PEVEOGTVS&v=20180909' + '&query=' + placeItem.name;

                $.ajax({
                    url: foursquareURL,
                    dataType: "json",
                    success: function(data) {
                        var results = data.response.venues[0];
                        var street = results.location.formattedAddress[0];
                        var city = results.location.formattedAddress[1];
                        contentString = '<div class="info-window-content"><div class="title"><b>' + placeItem.name + "</b></div>" +
                            '<div class="content">' + street + "</div>" +
                            '<div class="content">' + city + "</div>";
                        infoWindow.setContent(contentString);

                        if (openedInfoWindow !== null) openedInfoWindow.close();
                        infoWindow.open(map, placeItem.marker);
                        openedInfoWindow = infoWindow;
                        google.maps.event.addListener(infoWindow, 'closeclick', function() {
                            openedInfoWindow = null;
                        });

                        
                    },
                    error: function(jqXHR, exception) {
                                    window.alert('Failed to load Content from Foursquare');
                                }
                });
                return false;
            });
        });


        //Connect marker to list selection
        self.markerConnect = function(marker) {
            google.maps.event.trigger(this.marker, 'click');
        };

        //Make filter search input an observable
        self.query = ko.observable('');

        //ko.computed is used to filter and return items that match the query string input by users
        self.filteredPlaces = ko.computed(function(placeItem) {
            var filter = self.query().toLowerCase();
            //If searchbox empty return the full list and set all markers visible
            if (!filter) {
                self.markerArray().forEach(function(placeItem) {
                    placeItem.marker.setVisible(true);
                });
                return self.markerArray();
                //Else use startsWith to compare search term to list and make visible those that match
            } else {
                return ko.utils.arrayFilter(self.markerArray(), function(placeItem) {
                    searchTerm = strStartsWith(placeItem.name.toLowerCase(), filter);
                    placeItem.marker.setVisible(false);
                    if (searchTerm) {
                        placeItem.marker.setVisible(true);
                        return searchTerm;
                    }
                });
            }
        }, self);

        var strStartsWith = function(string, startsWith) {
            string = string || "";
            if (startsWith.length > string.length) {
                return false;
            }
            return string.substring(0, startsWith.length) === startsWith;
        };
    
    };
    //Call the viewModel function
    ko.applyBindings(new viewModel());

}
//error handling
function mapErrorHandling() {
    alert("unable to fetch resources from google maps");
}