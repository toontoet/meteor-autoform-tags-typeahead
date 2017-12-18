Package.describe({
    name: 'cloudspider:autoform-tags-typeahead',
    version: '0.7.1',
    summary: 'Provides a autoform tags input with typeahead functionality',
    git: 'https://github.com/Redroest/meteor-autoform-tags-typeahead',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.1.0.3');

    api.use([
        'mongo',
        'aldeed:collection2-core@2.1.0',
        'aldeed:autoform@6.0.0',
        'ajduke:bootstrap-tagsinput@0.7.0',
        'mrt:bootstrap3-typeahead',
        'templating'
    ]);

    api.addFiles([
        'common/tag.js',
    ], ['server', 'client']);

    api.addFiles([
        'tags-typeahead.html',
        'tags-typeahead.js',
        'tags-typeahead.css'
    ], 'client');

    api.export(['TagsUtil', 'CloudspiderTags']);
});

