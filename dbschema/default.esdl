using extension auth;
using extension pgcrypto;

module default {
    scalar type TitleType extending enum<MOVIE, SERIES>;
    scalar type TitleStatus extending enum<UPCOMING, PENDING, WATCHING, UNFINISHED, FINISHED>;
    
    global CurrentUser := (
        assert_single((
            select User
            filter .identity = global ext::auth::ClientTokenIdentity
        ))
    );

    type User {
        required identity: ext::auth::Identity;
        required email: str;
        username: str;
        avatar: str;
        createdAt: datetime {
            rewrite insert using (datetime_of_statement());
        }
        updatedAt: datetime {
            rewrite insert using (datetime_of_statement());
            rewrite update using (datetime_of_statement());
        }
    }

    type Title {
        required imdbId: str;
        required tmdbId: int32;
        required title: str;
        description: str;
        required date: cal::local_date;
        poster: str;
        posterBlur: str;
        type: TitleType;
        updated: datetime {
            rewrite insert using (datetime_of_statement());
            rewrite update using (datetime_of_statement());
        }
        required createdAt: datetime {
            default := datetime_current();
        }
        required genres: array<int32>;
    }

    type List {
        required createdBy: User;
        required title: Title;
        required status: TitleStatus;
        rating: float32;
        required createdAt: datetime {
            default := datetime_current();
        }
        updatedAt: datetime {
            rewrite insert using (datetime_of_statement());
            rewrite update using (datetime_of_statement());
        }
    }
};