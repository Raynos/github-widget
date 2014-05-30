var mercury = require('mercury');
var xhr = require('xhr');
var console = require('console');
var h = mercury.h;


var liftThunkLatest = require('./lib/observ-lift-thunk-latest.js')

GithubWidget.render = Render;

module.exports = GithubWidget

function GithubWidget(userName) {
    var state = mercury.hash({
        userName: mercury.value(userName),
        user: mercury.hash({
            userName: mercury.value(''),
            avatar_url: mercury.value('')
        }),
        repos: mercury.array([])
    });
    window.state = state;

    var events = {
        user: liftThunkLatest(state.userName,
            fetchUser)
    }

    events.user(function (tuple) {
        if (tuple.error) {
            console.error(tuple.error);
            return;
        }

        console.log('tuple', tuple);

        state.user.userName.set(tuple.user.login)
        state.user.avatar_url.set(tuple.user.avatar_url)

        tuple.repos.forEach(function (repo) {
            state.repos.push(repo)
        })
    })

    return { state: state }
}

function fetchUser(userName) {
    return function (send) {
        var uri = 'https://api.github.com/users/' + userName +
            '/repos?sort=pushed'

        xhr({
            uri: uri,
            method: 'GET',
            json: true
        }, onResponse)

        function onResponse(err, resp) {
            if (err) {
                return send({ error: err.message })
            }

            send({
                user: resp.body[0].owner,
                repos: resp.body
            })
        }
    }
}

function Render(state) {
    return h('.panel .panel-default', {
        style: {
            width: '350px'
        }
    }, [
        /*  Horrible hack. Depending on bootstrap is insane
            But it's midnight, I'll fix this later.
            The correct thing is to write your own stylesheet
            and use brfs to require it
        */
        h('link', {
            rel: 'stylesheet',
            href: 'https://netdna.bootstrapcdn.com/bootstrap' +
                '/3.1.1/css/bootstrap.min.css'
        }),
        /*  Horrible hack. Depending on fontawesome is insane.
            But it's midnight, I'll fix this later.
            The correct thing is to create your own icons and
            use brfs to require them
        */
        h('link', {
            rel: 'stylesheet',
            href: 'https://cdnjs.cloudflare.com/ajax/libs/' +
                'font-awesome/4.0.3/css/font-awesome.min.css'
        }),
        h('.panel-heading', 'Github repos'),
        h('.panel-body', [
            body(state)
        ]),
        content(state),
        h('.panel-footer', [
            footer(state)
        ])
    ]);
}

function body(state) {
    return h('.media', [
        h('a.pull-left', {
            href: 'https://github.com/' + state.user.userName
        }, [
            h('img.media-object', {
                src: state.user.avatar_url,
                width: '64',
                height: '64',
                alt: state.user.userName
            })
        ]),
        h('.media-body', [
            h('h4.media-heading', state.user.userName),
            h('span', state.repos.length + ' ' + 'repos ('),
            h('a', {
                href: 'https://github.com/' +
                    state.user.userName + '?tab=repositories'
            }, 'see all'),
            h('span', ')')
        ])
    ])
}

function content(state) {
    return h('ul.list-group', state.repos.map(function (repo) {
        return h('li.list-group-item', [
            h('a', {
                href: repo.html_url
            }, repo.full_name),
            h('span.pull-right', [
                h('i.fa.fa-eye', String(repo.watchers_count)),
                ' ',
                h('i.fa.fa-star', String(repo.stargazers_count)),
                ' ',
                h('i.fa.fa-code-fork', String(repo.forks))
            ]),
            h('br'),
            repo.description
        ])
    }))
}

function footer(state) {
    return h('div', [
        h('a', {
            href: 'https://github.com/' + state.user.userName,
        }, state.user.userName),
        h('span', ' @ Github')
    ]);
}
