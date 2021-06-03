package io.tolgee.model

import io.tolgee.model.key.Key
import java.util.*
import javax.persistence.*
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Pattern
import javax.validation.constraints.Size

@Entity
@EntityListeners(Project.Companion.ProjectListener::class)
@Table(uniqueConstraints = [UniqueConstraint(columnNames = ["address_part"], name = "project_address_part_unique")])
data class Project(
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Long = 0L,

        @field:NotBlank
        @field:Size(min = 3, max = 50)
        var name: String? = null,

        @field:Size(min = 3, max = 2000)
        var description: String? = null,

        @Column(name = "address_part")
        @field:Size(min = 3, max = 60)
        @field:Pattern(regexp = "^[a-z0-9-]*[a-z]+[a-z0-9-]*$", message = "invalid_pattern")
        var slug: String? = null,
) : AuditModel() {

    @OrderBy("abbreviation")
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "project")
    var languages: MutableSet<Language> = LinkedHashSet()

    @OneToMany(mappedBy = "project")
    var permissions: MutableSet<Permission> = LinkedHashSet()

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "project")
    var keys: MutableSet<Key> = LinkedHashSet()

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "project")
    var apiKeys: MutableSet<ApiKey> = LinkedHashSet()

    @ManyToOne(optional = true)
    var userOwner: UserAccount? = null

    @ManyToOne(optional = true)
    var organizationOwner: Organization? = null

    constructor(name: String?, description: String? = null, slug: String?, userOwner: UserAccount?)
            : this(id = 0L, name, description, slug) {
        this.userOwner = userOwner
    }

    constructor(name: String?,
                description: String? = null,
                slug: String?,
                organizationOwner: Organization?,
                userOwner: UserAccount? = null)
            : this(id = 0L, name, description, slug) {
        this.organizationOwner = organizationOwner
        this.userOwner = userOwner
    }

    fun getLanguage(abbreviation: String): Optional<Language> {
        return languages.stream().filter { l: Language -> (l.abbreviation == abbreviation) }.findFirst()
    }

    companion object {
        class ProjectListener {
            @PrePersist
            @PreUpdate
            fun preSave(project: Project) {
                if (!(project.organizationOwner == null).xor(project.userOwner == null)) {
                    throw Exception("Exactly one of organizationOwner or userOwner must be set!")
                }
            }
        }
    }

}