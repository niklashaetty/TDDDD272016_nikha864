drop table if exists courses;
drop table if exists users;

create table users(
    username text not null unique,
    password_hash bytea not null unique,
    saved_plans text[],
    primary key(username)
);

create table courses(
    code text not null unique,
    name text not null,
    block text not null,
    period text not null,
    level text not null,
    ects text not null,
    primary key(code)
);
