
AutoForm.addInputType("tagsTypeahead", {
    template: "afTagsTypeahead",
    valueIn: function(value) {
        if(!value) {
            return '';
        }

        return value.join(',');
    },
    valueOut: function() {
        if(!this.val()) {
            return '';
        }
        var tags = this.val().replace(' ', '').split(',');

        var tagNames = _.map(tags, function(title){
            var tag = TagsUtil.findOrCreate(title);
            return tag.title;
        });

        return tagNames;
    }
});

Template.afTagsTypeahead.onRendered(function() {
    var options = {
        // Clicking a suggestion blurs the input first; adding on blur races
        // with typeahead select and leaves the query text in the field.
        addOnBlur: false,
        typeahead: {
            displayKey: 'title',
            valueKey: 'title',
            source: function(str) {
                return CloudspiderTags.find().map(function(tag){
                    return tag.title;
                });
            }
        }
    };

    //Extend tagsinput options
    if(this.data.atts && this.data.atts.tagsinput) {
        _.extend(options, this.data.atts.tagsinput);
    }

    //Add typeahead options if there are any
    if(this.data.atts && this.data.atts.typeahead) {
        options.typeahead = this.data.atts.typeahead;
    }

    var $el = this.$('input').first();
    $el.tagsinput(options);
    $el.attr('data-schema-key', this.data.atts['data-schema-key']);

    var tagsInput = $el.data('tagsinput');
    if (!tagsInput || !tagsInput.$input) {
        return;
    }

    var $textInput = tagsInput.$input;

    function clearInput() {
        $textInput.val('');
        $textInput.attr('size', Math.max(1, tagsInput.inputSize || 1));
    }

    var typeahead = $textInput.data('typeahead');
    if (typeahead) {
        // bootstrap-tagsinput calls typeahead('val', '') after every successful
        // add (twitter-typeahead API). bootstrap3-typeahead has no val() and
        // throws, which aborts the rest of add/select — so the menu stays open
        // and the query text remains. Duplicates skip that call, which is why
        // only new selections appeared broken.
        typeahead.val = function() {
            clearInput();
        };

        // bootstrap-tagsinput's updater returns the item text; typeahead
        // writes that back into the input. Always return '' instead.
        typeahead.updater = function(item) {
            var value = (this.map && Object.prototype.hasOwnProperty.call(this.map, item))
                ? this.map[item]
                : item;
            if (value !== undefined && value !== null && String(value).length) {
                tagsInput.add(value);
            }
            return '';
        };

        // Keep focus on the input when clicking a suggestion so blur/focusout
        // cannot race with select().
        typeahead.$menu.on('mousedown', function(event) {
            event.preventDefault();
        });

        var originalSelect = typeahead.select;
        typeahead.select = function() {
            originalSelect.apply(this, arguments);
            clearInput();
            setTimeout(clearInput, 0);
            return this;
        };
    }

    // Enter: add tag ourselves and block form submit + tagsinput keypress
    // (which would otherwise race with typeahead's keyup select).
    $textInput.on('keydown', function(event) {
        if (event.which !== 13) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        var ta = $textInput.data('typeahead');
        if (ta && ta.shown) {
            ta.select();
            return;
        }

        var raw = ($textInput.val() || '').trim();
        if (raw) {
            tagsInput.add(raw);
        }
        clearInput();
    });

    $textInput.on('keypress', function(event) {
        if (event.which === 13) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    });

    $el.on('itemAdded', function() {
        clearInput();
        setTimeout(clearInput, 0);
    });
});
