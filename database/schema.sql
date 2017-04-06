create table if not exists users(
    uid serial not null unique,
    username text not null unique,
    password_hash text not null unique,
    primary key(uid)
);

create table if not exists tokens(
    username text not null unique,
    token text not null unique,
    primary key(token)
);
