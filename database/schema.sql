drop table if exists tokens;
drop table if exists users;

create table users(
    username text not null unique,
    password_hash bytea not null unique,
    primary key(username)
);
