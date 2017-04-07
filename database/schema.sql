drop table if exists tokens;
drop table if exists users;

create table users(
    username text not null unique,
    password_hash bytea not null unique,
    primary key(uid)
);

create table tokens(
    username text not null unique,
    token text not null unique,
    primary key(token)
);
