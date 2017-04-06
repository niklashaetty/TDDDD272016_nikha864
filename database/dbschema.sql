create table if not exists users(
    uid serial not null unique,
    username text not null unique,
    hash text not null unique
    primary key(uid)
);