// GENERATED by @edgedb/generate v0.5.3

import * as $ from "../reflection";
import * as _ from "../imports";
import type * as _std from "./std";
import type * as _extauth from "./ext/auth";
import type * as _cal from "./cal";
export type $TitleStatus = {
  "UPCOMING": $.$expr_Literal<$TitleStatus>;
  "PENDING": $.$expr_Literal<$TitleStatus>;
  "WATCHING": $.$expr_Literal<$TitleStatus>;
  "UNFINISHED": $.$expr_Literal<$TitleStatus>;
  "FINISHED": $.$expr_Literal<$TitleStatus>;
} & $.EnumType<"default::TitleStatus", ["UPCOMING", "PENDING", "WATCHING", "UNFINISHED", "FINISHED"]>;
const TitleStatus: $TitleStatus = $.makeType<$TitleStatus>(_.spec, "78f212c2-0f20-11ef-b74d-2da27a23fc4b", _.syntax.literal);

export type $TitleType = {
  "MOVIE": $.$expr_Literal<$TitleType>;
  "SERIES": $.$expr_Literal<$TitleType>;
} & $.EnumType<"default::TitleType", ["MOVIE", "SERIES"]>;
const TitleType: $TitleType = $.makeType<$TitleType>(_.spec, "78c34f43-0f20-11ef-bc71-afcca53b8a9b", _.syntax.literal);

export type $UserλShape = $.typeutil.flatten<_std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588λShape & {
  "avatar": $.PropertyDesc<_std.$str, $.Cardinality.AtMostOne, false, false, false, false>;
  "updatedAt": $.PropertyDesc<_std.$datetime, $.Cardinality.AtMostOne, false, false, false, false>;
  "email": $.PropertyDesc<_std.$str, $.Cardinality.One, true, false, false, false>;
  "username": $.PropertyDesc<_std.$str, $.Cardinality.AtMostOne, true, false, false, false>;
  "name": $.PropertyDesc<_std.$str, $.Cardinality.One, false, false, false, false>;
  "status": $.PropertyDesc<$TitleStatus, $.Cardinality.One, false, false, false, true>;
  "identity": $.LinkDesc<_extauth.$Identity, $.Cardinality.One, {}, true, false,  false, false>;
  "followers": $.LinkDesc<$Follower, $.Cardinality.Many, {}, false, false,  false, false>;
  "createdAt": $.PropertyDesc<_std.$datetime, $.Cardinality.One, false, false, false, true>;
  "<addedBy[is Hive]": $.LinkDesc<$Hive, $.Cardinality.Many, {}, false, false,  false, false>;
  "<followed[is Follower]": $.LinkDesc<$Follower, $.Cardinality.AtMostOne, {}, true, false,  false, false>;
  "<follower[is Follower]": $.LinkDesc<$Follower, $.Cardinality.AtMostOne, {}, true, false,  false, false>;
  "<addedBy": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
  "<followed": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
  "<follower": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
}>;
type $User = $.ObjectType<"default::User", $UserλShape, null, [
  ..._std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588['__exclusives__'],
  {email: {__element__: _std.$str, __cardinality__: $.Cardinality.One | $.Cardinality.AtMostOne },},
  {username: {__element__: _std.$str, __cardinality__: $.Cardinality.One | $.Cardinality.AtMostOne },},
  {identity: {__element__: _extauth.$Identity, __cardinality__: $.Cardinality.One | $.Cardinality.AtMostOne },},
]>;
const $User = $.makeType<$User>(_.spec, "78c7e9e7-0f20-11ef-b210-6f8a0b26fadd", _.syntax.literal);

const User: $.$expr_PathNode<$.TypeSet<$User, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($User, $.Cardinality.Many), null);

export type $CurrentUserλShape = $.typeutil.flatten<$UserλShape & {
}>;
type $CurrentUser = $.ObjectType<"default::CurrentUser", $CurrentUserλShape, null, [
  ...$User['__exclusives__'],
]>;
const $CurrentUser = $.makeType<$CurrentUser>(_.spec, "78f18c97-0f20-11ef-9b13-cbee5021a9a9", _.syntax.literal);

const CurrentUser: $.$expr_PathNode<$.TypeSet<$CurrentUser, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($CurrentUser, $.Cardinality.Many), null);

export type $FollowerλShape = $.typeutil.flatten<_std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588λShape & {
  "followed": $.LinkDesc<$User, $.Cardinality.One, {}, true, false,  false, false>;
  "follower": $.LinkDesc<$User, $.Cardinality.One, {}, true, false,  false, false>;
  "createdAt": $.PropertyDesc<_std.$datetime, $.Cardinality.One, false, false, false, true>;
  "<followers[is User]": $.LinkDesc<$User, $.Cardinality.Many, {}, false, false,  false, false>;
  "<followers[is CurrentUser]": $.LinkDesc<$CurrentUser, $.Cardinality.Many, {}, false, false,  false, false>;
  "<followers": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
}>;
type $Follower = $.ObjectType<"default::Follower", $FollowerλShape, null, [
  ..._std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588['__exclusives__'],
  {followed: {__element__: $User, __cardinality__: $.Cardinality.One | $.Cardinality.AtMostOne },},
  {follower: {__element__: $User, __cardinality__: $.Cardinality.One | $.Cardinality.AtMostOne },},
]>;
const $Follower = $.makeType<$Follower>(_.spec, "0264bcb4-10d3-11ef-ac05-3f21853ffd6d", _.syntax.literal);

const Follower: $.$expr_PathNode<$.TypeSet<$Follower, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($Follower, $.Cardinality.Many), null);

export type $HiveλShape = $.typeutil.flatten<_std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588λShape & {
  "createdAt": $.PropertyDesc<_std.$datetime, $.Cardinality.One, false, false, false, true>;
  "rating": $.PropertyDesc<_std.$float32, $.Cardinality.AtMostOne, false, false, false, false>;
  "status": $.PropertyDesc<$TitleStatus, $.Cardinality.One, false, false, false, false>;
  "updatedAt": $.PropertyDesc<_std.$datetime, $.Cardinality.AtMostOne, false, false, false, false>;
  "finishedAt": $.PropertyDesc<_std.$datetime, $.Cardinality.AtMostOne, false, false, false, false>;
  "isFavorite": $.PropertyDesc<_std.$bool, $.Cardinality.One, false, false, false, true>;
  "title": $.LinkDesc<$Title, $.Cardinality.One, {}, true, false,  false, false>;
  "addedBy": $.LinkDesc<$User, $.Cardinality.One, {}, false, false,  false, false>;
}>;
type $Hive = $.ObjectType<"default::Hive", $HiveλShape, null, [
  ..._std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588['__exclusives__'],
  {title: {__element__: $Title, __cardinality__: $.Cardinality.One | $.Cardinality.AtMostOne },},
]>;
const $Hive = $.makeType<$Hive>(_.spec, "78f22af3-0f20-11ef-be3f-a9d6eece43b2", _.syntax.literal);

const Hive: $.$expr_PathNode<$.TypeSet<$Hive, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($Hive, $.Cardinality.Many), null);

export type $TitleλShape = $.typeutil.flatten<_std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588λShape & {
  "genres": $.PropertyDesc<$.ArrayType<_std.$int32>, $.Cardinality.One, false, false, false, false>;
  "createdAt": $.PropertyDesc<_std.$datetime, $.Cardinality.One, false, false, false, true>;
  "date": $.PropertyDesc<_cal.$local_date, $.Cardinality.One, false, false, false, false>;
  "description": $.PropertyDesc<_std.$str, $.Cardinality.AtMostOne, false, false, false, false>;
  "poster": $.PropertyDesc<_std.$str, $.Cardinality.AtMostOne, false, false, false, false>;
  "posterBlur": $.PropertyDesc<_std.$str, $.Cardinality.AtMostOne, false, false, false, false>;
  "tmdbId": $.PropertyDesc<_std.$int32, $.Cardinality.One, false, false, false, false>;
  "type": $.PropertyDesc<$TitleType, $.Cardinality.AtMostOne, false, false, false, false>;
  "updated": $.PropertyDesc<_std.$datetime, $.Cardinality.AtMostOne, false, false, false, false>;
  "imdbId": $.PropertyDesc<_std.$str, $.Cardinality.AtMostOne, false, false, false, false>;
  "name": $.PropertyDesc<_std.$str, $.Cardinality.One, false, false, false, false>;
  "<title[is Hive]": $.LinkDesc<$Hive, $.Cardinality.AtMostOne, {}, true, false,  false, false>;
  "<title": $.LinkDesc<$.ObjectType, $.Cardinality.Many, {}, false, false,  false, false>;
}>;
type $Title = $.ObjectType<"default::Title", $TitleλShape, null, [
  ..._std.$Object_8ce8c71ee4fa5f73840c22d7eaa58588['__exclusives__'],
]>;
const $Title = $.makeType<$Title>(_.spec, "78c3612e-0f20-11ef-acb9-7d6ec0bcb97f", _.syntax.literal);

const Title: $.$expr_PathNode<$.TypeSet<$Title, $.Cardinality.Many>, null> = _.syntax.$PathNode($.$toSet($Title, $.Cardinality.Many), null);

const $default__globals: {  CurrentUser: _.syntax.$expr_Global<
              // "default::CurrentUser",
              $CurrentUser,
              $.Cardinality.AtMostOne
              >} = {  CurrentUser: _.syntax.makeGlobal(
              "default::CurrentUser",
              $.makeType(_.spec, "78f18c97-0f20-11ef-9b13-cbee5021a9a9", _.syntax.literal),
              $.Cardinality.AtMostOne) as any};



export { TitleStatus, TitleType, $User, User, $CurrentUser, CurrentUser, $Follower, Follower, $Hive, Hive, $Title, Title };

type __defaultExports = {
  "TitleStatus": typeof TitleStatus;
  "TitleType": typeof TitleType;
  "User": typeof User;
  "CurrentUser": typeof CurrentUser;
  "Follower": typeof Follower;
  "Hive": typeof Hive;
  "Title": typeof Title;
  "global": typeof $default__globals
};
const __defaultExports: __defaultExports = {
  "TitleStatus": TitleStatus,
  "TitleType": TitleType,
  "User": User,
  "CurrentUser": CurrentUser,
  "Follower": Follower,
  "Hive": Hive,
  "Title": Title,
  "global": $default__globals
};
export default __defaultExports;
