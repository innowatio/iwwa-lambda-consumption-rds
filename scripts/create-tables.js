export const createTestDB = `

    --  USER

    CREATE TABLE IF NOT EXISTS user_app (
        id character varying(256) NOT NULL,
        user_name character varying(256),
        street character varying(256),
        street_number character varying(256),
        zip_code character varying(5),
        city character varying(256),
        user_since timestamp with time zone,
        customer_since timestamp with time zone,
        name character varying(256),
        province_id integer,
        CONSTRAINT user_app_pkey PRIMARY KEY (id)
    );


    -- METER

    CREATE TABLE IF NOT EXISTS meter (
        id character varying(256) NOT NULL,
        user_app_id character varying(256),
        meter_type character varying(256),
        street character varying(256),
        street_number character varying(256),
        zip_code character varying(5),
        city character varying(256),
        status character varying(256),
        peer_id integer,
        contracted_power integer,
        province_id integer,
        meter_code character varying,
        CONSTRAINT meter_pkey PRIMARY KEY (id),
        CONSTRAINT fk_child_user_app_id FOREIGN KEY (user_app_id)
            REFERENCES user_app(id)
            ON UPDATE NO ACTION ON DELETE NO ACTION
    );


    --  CONSUMPTION

    CREATE TABLE IF NOT EXISTS consumption (
        id serial NOT NULL,
        meter_id character varying(256),
        datetime timestamp with time zone,
        active_energy numeric(8,4),
        reactive_energy numeric(8,4),
        max_power numeric(8,4),
        CONSTRAINT consumption_pkey PRIMARY KEY (id)
    );

`;
