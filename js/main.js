function initAutocomplete() {
    if (jQuery("#mf-stor-locator").length > 0) {

        var infowindow = new google.maps.InfoWindow();
        var pyrmont = new google.maps.LatLng(40.416839100576084, -3.70346934304331);
        const map = new google.maps.Map(document.getElementById("mf-stor-locator"), {
            center: pyrmont,
            zoom: 5,
            mapTypeId: "roadmap"
        });

        // Create the search box and link it to the UI element.
        const input = document.getElementById("pac-input");
        const searchBox = new google.maps.places.SearchBox(input);
        document.getElementById("my-position").addEventListener('click', function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    map.setCenter(pos);
                    map.setZoom(14);
                    addMarkers(map, markers);
                });
            }
        });
        //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        // Bias the SearchBox results towards current map's viewport.
        map.addListener("bounds_changed", () => {
            searchBox.setBounds(map.getBounds());
        });

        let markers = [];

        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        addMarkers(map, markers);

        searchBox.addListener("places_changed", () => {
            const places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // For each place, get the icon, name and location.
            const bounds = new google.maps.LatLngBounds();
            places.forEach(place => {
                dataLayer.push({
                    'event': 'store_locator',
                    'eventCategory': 'Store Locator',
                    'eventAction': 'Find Click',
                    'eventLabel': place.formatted_address // string queried by the user, e.g. 'Madrid Spagna' 
                });

                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                const icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };
                // Create a marker for each place.
                markers.push(
                    new google.maps.Marker({
                        map,
                        icon,
                        title: place.name,
                        position: place.geometry.location
                    })
                );

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });

            map.fitBounds(bounds);
        });
    }
}

function addMarkers(map, markers) {
    jQuery.post(my_ajax_obj.ajax_url, {
        _ajax_nonce: my_ajax_obj.nonce,
        action: "mf_get_stores"
    }, function (data) {
        for (let i = 0; i < data.length; i++) {
            infowindow = new google.maps.InfoWindow();
            const marker = new google.maps.Marker({
                map,
                title: data[i].post_title,
                position: { lat: parseFloat(data[i].latitude), lng: parseFloat(data[i].longitude) }
            });
            marker.addListener('click', function () {
                infowindow.setContent('<h4>' + data[i].post_title + '</h4><p>' + data[i].address + '</p>');
                infowindow.open(map, marker);
            });
            markers.push(marker);
        }
        new MarkerClusterer(map, markers, {
            imagePath:
                "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
        });

    });
}
jQuery(document).ready(function ($) {
    $('#my-position').click(function () {
        dataLayer.push({
            'event': 'store_locator',
            'eventCategory': 'Store Locator',
            'eventAction': 'Find Click',
            'eventLabel': 'geolocation'
        });
    });
});