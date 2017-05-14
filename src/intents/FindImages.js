function SAIntent_findImages(page, target, cb) {
    page.attribute(target, 'src').then(function(attribute) {
        if (attribute) {
            cb(attribute);
        } else {
            page.cssAttribute(target, 'background-image').then(function(attribute) {
                cb(attribute);
            });
        }
    });
}