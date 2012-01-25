/*global Backbone:true, $:true, _:true, jQuery:true, console:true */

(function() {
"use strict";

// CONSTANTS
var FALLBACK = {
    URL: 'http://static.justin.tv/previews/404_user_50x50.png'
};
var PAGINATION = {
    ITEMS_PER_PAGE: 6
};

var User = Backbone.Model.extend();

var Users = Backbone.Collection.extend({
    model: User,
    comparator: function(item) {
    // DESC: add items to the collection in alphabetical order by name
        return item.get('name');
    }
});

var UsersView = Backbone.View.extend({
    initialize: function() {
    // DESC: initialization

        // minimalize the number of DOM searches
        this.$header = $('#header');
        this.$users = $('#users');
        this.$footer = $('#footer');
        this.$superCheckbox = $('.supercheckbox');

        // set the initial pagination values
        this.paginationFrom = 1;
        this.paginationItemsPerPage = PAGINATION.ITEMS_PER_PAGE;

        // creating the collection
        this.users = new Users(null, {view: this});

        // load the templates only once
        this.usersTemplate = _.template($("#users-tmpl").html());
        this.footerTemplate = _.template($("#footer-tmpl").html());

        // rerender if new item added to the collection
        this.users.bind('add',this.render,this);

        // place the event handlers
        this.handlers();
    },
    render: function() {
    // DESC: render the users list and the footer

        // render the users list
        var item, items = [], num;
        for (var i = 0; i < this.paginationItemsPerPage; i++) {
            num = i + this.paginationFrom - 1;
            if (num < this.users.length) {
                item = this.users.at(num);
                // if item has no image, use the fallback image
                if (!item.get('image')) {
                    item.set({ image: FALLBACK.URL });
                }
                items.push(item.toJSON());
            }
        }
        this.$users.html(this.usersTemplate({users: items }));

        // render the pagination
        var countTo;
        countTo = this.paginationFrom + this.paginationItemsPerPage - 1;
        if (countTo > this.users.length) {
            countTo = this.users.length;
        }
        if (this.paginationFrom === this.users.length) {
            countTo = 0;
        }
        var data = {
            countFrom: this.paginationFrom,
            countTo: countTo,
            countTotal: this.users.length,
            paginationCurrent: Math.ceil((this.paginationFrom) / this.paginationItemsPerPage),
            paginationTotal: Math.ceil(this.users.length / this.paginationItemsPerPage)
        };
        this.$footer.html(this.footerTemplate({data: data }));
    },
    selectUser: function($li,$input) {
    // DESC: flag/unflag a user as selected
        var name, names, indexOfName, currentItem, selected;

        // get the current item from the collection
        name = $li.data('name');
        names = this.users.pluck('name');
        indexOfName = names.indexOf(name);
        currentItem = this.users.at(indexOfName);

       // set the selected value both on the UI and in the collection
        if ($input.attr('checked')) {
            $input.removeAttr('checked');
            selected = false;
        } else {
            $input.attr('checked','checked');
            selected = true;
        }
        currentItem.set({selected: selected});

        // uncheck the check-all box
        if (this.$superCheckbox.attr('checked')) {
            this.$superCheckbox.removeAttr('checked');
        }
    },
    selectAllUsers: function($input) {
    // DESC: flag/unflag all the users as selected

        var $allInputs, selected, currentItem;

        $allInputs = this.$users.find('input');

        if ($input.attr('checked')) {
            $allInputs.attr('checked','checked');
            selected = true;
        } else {
            $allInputs.removeAttr('checked');
            selected = false;
        }

        for (var i = 0; i < this.users.length; i++) {
            currentItem = this.users.at(i);
            currentItem.set({selected: selected});
        }
    },
    handlers: function() {
    // DESC: place event handlers on DOM objects

        var self = this;

        // selecting a user by div
        this.$users.delegate('.user','click', function(e) {
            self.selectUser($(this),$(this).find('input'));
        });

        // selecting a user by checkbox
        this.$users.delegate('input','click', function(e) {
            self.selectUser($(this).parent(),$(this));
        });

        // selecting all users
        this.$header.delegate('.supercheckbox','click', function(e) {
            self.selectAllUsers($(this));
        });

        // pagination
        this.$footer.delegate('a','click', function(e) {
            e.preventDefault();
            var page = $(this).data('page');
            self.paginationFrom = self.paginationItemsPerPage * page - self.paginationItemsPerPage + 1;
            self.render();
        });
    }
});

var usersView = new UsersView();

// upload the collection with data
usersView.users.add(users);

})();
